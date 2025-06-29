// File: src/models/AvailableSlot.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

// 1) Define la forma de cada subdocumento de availability
export interface IAvailabilityItem {
  /** Fecha en formato YYYY-MM-DD */
  day: string
  /** Array de horas en HH:mm */
  hours: string[]
}

// 2) Interface del documento completo
export interface IAvailableSlot extends Document {
  adminId: string
  availability: IAvailabilityItem[]
  createdAt: Date
  updatedAt: Date
}

// 3) Schema
const AvailabilityItemSchema = new Schema<IAvailabilityItem>(
  {
    day: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'El campo `day` debe tener formato YYYY-MM-DD'],
    },
    hours: [
      {
        type: String,
        required: true,
        match: [/^[0-2]\d:[0-5]\d$/, 'Cada hora debe tener formato HH:mm'],
      },
    ],
  },
  { _id: true } // Genera un _id para cada subdocumento si lo necesitas
)

const AvailableSlotSchema = new Schema<IAvailableSlot>(
  {
    adminId: { type: String, required: true, unique: true },
    availability: {
      type: [AvailabilityItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// 4) Índices compuestos para agilizar búsquedas por adminId y día
AvailableSlotSchema.index({ adminId: 1 })
AvailableSlotSchema.index({ adminId: 1, 'availability.day': 1 })

// 5) Modelo
const AvailableSlot: Model<IAvailableSlot> =
  mongoose.models.AvailableSlot ||
  mongoose.model<IAvailableSlot>('AvailableSlot', AvailableSlotSchema)

export default AvailableSlot
