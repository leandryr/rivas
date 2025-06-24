// src/models/Subscriber.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscriber extends Document {
  email: string
  createdAt: Date
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Subscriber =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema)
