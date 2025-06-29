// File: src/models/Meeting.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMeeting extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  date: Date;
  reason?: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    date: { type: Date, required: true },
    reason: { type: String, trim: true },

    status: {
      type: String,
      enum: ['Pendiente', 'Confirmada', 'Cancelada'],
      default: 'Pendiente',
    },

    // ← ❶ AQUI: reemplaza la definición original de `link`
    link: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(this: IMeeting, v: string) {
          // si está confirmada, el link debe no estar vacío
          return this.status !== 'Confirmada' || (typeof v === 'string' && v.length > 0)
        },
        message: 'Se requiere enlace de Meet/Zoom al confirmar la reunión',
      },
    },
  },
  { timestamps: true }
);

// ← ❷ AQUI: añade tus índices para búsquedas rápidas
MeetingSchema.index({ date: 1 })
MeetingSchema.index({ userId: 1 })
MeetingSchema.index({ status: 1 })

const Meeting: Model<IMeeting> =
  mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema)

export default Meeting
