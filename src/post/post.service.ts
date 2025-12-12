import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}
  private validateObjectId(id: string, fieldName: string = 'ID'): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format`);
    }
  }

  create(createPostDto: CreatePostDto, creatorUser: string) {
    const createdPost = new this.postModel({ ...createPostDto, creatorUser });
    return createdPost.save();
  }

  findAll() {
    return this.postModel
      .find()
      .populate<{
        creatorUser: User;
      }>({
        path: 'creatorUser',
        select: '-password -roles',
      })
      .exec();
  }

  findOne(id: string) {
    return this.postModel
      .findById(id)
      .populate<{
        creatorUser: User;
      }>({
        path: 'creatorUser',
        select: '-password -roles',
      })
      .exec();
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.postModel.findByIdAndDelete(id).exec();
  }

  async likePost(postId: string, userId: string) {
    this.validateObjectId(postId, 'post ID');
    this.validateObjectId(userId, 'user ID');

    const post = await this.postModel.findById(postId).exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = post.likedBy.some((id) => id.equals(userObjectId));

    if (alreadyLiked) {
      throw new BadRequestException('You have already liked this post');
    }

    return this.postModel
      .findByIdAndUpdate(
        postId,
        {
          $push: { likedBy: userObjectId },
          $inc: { likesCount: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async unlikePost(postId: string, userId: string) {
    this.validateObjectId(postId, 'post ID');
    this.validateObjectId(userId, 'user ID');

    const post = await this.postModel.findById(postId).exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasLiked = post.likedBy.some((id) => id.equals(userObjectId));

    if (!hasLiked) {
      throw new BadRequestException('You have not liked this post');
    }

    return this.postModel
      .findByIdAndUpdate(
        postId,
        {
          $pull: { likedBy: userObjectId },
          $inc: { likesCount: -1 },
        },
        { new: true },
      )
      .exec();
  }

  async getPostLikes(postId: string) {
    this.validateObjectId(postId, 'post ID');

    const post = await this.postModel
      .findById(postId)
      .populate<{ likedBy: User[] }>({
        path: 'likedBy',
        select: '-password -roles',
      })
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      likesCount: post.likesCount,
      likedBy: post.likedBy,
    };
  }
}
