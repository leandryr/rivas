// src/models/Comment.ts
import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IComment extends Document {
  post: Types.ObjectId
  authorName: string
  text: string
  createdAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    post:       { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorName: { type: String, required: true, trim: true },
    text:       { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export const Comment =
  mongoose.models.Comment ||
  mongoose.model<IComment>('Comment', CommentSchema)
