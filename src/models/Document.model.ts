// src/models/Document.model.ts

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDocument extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  url: string;
  uploader: Types.ObjectId;
  forProject?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    filename: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    url: { type: String, required: true, trim: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    forProject: { type: Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
