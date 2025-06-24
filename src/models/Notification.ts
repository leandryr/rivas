// src/models/Notification.ts
import { Schema, model, models } from 'mongoose'

export interface INotification {
  userId: string
  message: string
  link?: string
  read: boolean
}

const NotificationSchema = new Schema<INotification>(
  {
    userId:  { type: String, required: true, index: true },
    message: { type: String, required: true },
    link:    { type: String },                // <-- nuevo campo opcional
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default models.Notification ||
  model<INotification>('Notification', NotificationSchema)
