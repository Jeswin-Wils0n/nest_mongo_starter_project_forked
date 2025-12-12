import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
export class Post {
  @Prop({
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  creatorUser: mongoose.Types.ObjectId;

   @Prop({
    type: Number,
    default: 0,
  })
  likesCount: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  likedBy: mongoose.Types.ObjectId[];
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);
