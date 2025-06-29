// src/models/Subscriber.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubscriber extends Document {
  email: string
  createdAt: Date
}

const SubscriberSchema: Schema<ISubscriber> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// Avoid model overwrite
const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema)

export default Subscriber
