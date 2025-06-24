// src/models/Meeting.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMeeting extends Document {
  userId: Types.ObjectId;    // Quién solicitó la reunión
  projectId: Types.ObjectId; // Proyecto asociado
  date: Date;                // Fecha y hora de la reunión
  reason?: string;           // Motivo opcional
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  link?: string;             // Nuevo campo: enlace de Meet/Zoom (solo cuando se confirma)
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
    link: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const Meeting: Model<IMeeting> = mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);
export default Meeting;
