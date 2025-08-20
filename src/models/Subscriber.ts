import mongoose, { Schema, Document, models } from 'mongoose'

export interface ISubscriber extends Document {
  email: string
  createdAt: Date
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Subscriber =
  models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema)

export default Subscriber
