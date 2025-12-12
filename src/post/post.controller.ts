import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller({
  path: 'posts',
  version: '1',
})
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Req() request: Request, @Body() createPostDto: CreatePostDto) {
    const requestUser = (request as any).user as any | undefined;

    if (!requestUser) {
      throw new NotFoundException('User not found in request');
    }

    return this.postService.create(createPostDto, requestUser.sub);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }

  @Post(':id/like')
  likePost(@Param('id') id: string, @Req() request: Request) {
    const requestUser = (request as any).user as any | undefined;

    if (!requestUser) {
      throw new NotFoundException('User not found in request');
    }

    return this.postService.likePost(id, requestUser.sub);
  }

  @Delete(':id/like')
  unlikePost(@Param('id') id: string, @Req() request: Request) {
    const requestUser = (request as any).user as any | undefined;

    if (!requestUser) {
      throw new NotFoundException('User not found in request');
    }

    return this.postService.unlikePost(id, requestUser.sub);
  }

  @Get(':id/likes')
  getPostLikes(@Param('id') id: string) {
    return this.postService.getPostLikes(id);
  }

}
