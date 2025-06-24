// src/models/FileAsset.model.ts
import { Schema, model, models, Document, Types } from 'mongoose'

export interface IFileAsset extends Document {
  originalName: string
  url: string
  uploader: Types.ObjectId // referencia al usuario (cliente o admin)
  forProject: Types.ObjectId
  forClient?: Types.ObjectId // opcional para admins
  fileType: 'document' | 'image' | 'video' | 'screenshot'
  isAdminUpload: boolean
  title?: string
  createdAt: Date
  updatedAt: Date
}

const FileAssetSchema = new Schema<IFileAsset>(
  {
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    forProject: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    forClient: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    fileType: {
      type: String,
      required: true,
      enum: ['document', 'image', 'video', 'screenshot'],
    },
    isAdminUpload: { type: Boolean, default: false },
    title: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

export default models.FileAsset || model<IFileAsset>('FileAsset', FileAssetSchema)
