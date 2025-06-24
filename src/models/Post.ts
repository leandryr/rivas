// src/models/Post.ts
import mongoose, { Schema, Document, Types, Model } from 'mongoose'

export interface IPost extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl?: string
  youtubeLink?: string
  tags: string[]
  status: 'draft' | 'published'
  author: Types.ObjectId
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    title:         { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, trim: true },
    excerpt:       { type: String, required: true },
    content:       { type: String, required: true },
    coverImageUrl: { type: String },
    youtubeLink:   { type: String },
    tags:          { type: [String], default: [] },
    status:        { type: String, enum: ['draft', 'published'], default: 'draft' },
    author:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt:   { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Genera el slug automáticamente si no se proporciona
PostSchema.pre<IPost>('validate', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }

  next()
})

// Evita recompilar el modelo en caliente en Next.js
const PostModel: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)

export { PostModel as Post }
