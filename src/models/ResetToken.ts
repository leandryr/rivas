import mongoose, { Schema, model, models, Types } from 'mongoose'

const ResetTokenSchema = new Schema({
  userId:    { type: Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true })

export default models.ResetToken || model('ResetToken', ResetTokenSchema)