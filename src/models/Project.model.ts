import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProject extends Document {
  ownerId: Types.ObjectId; // Referencia al usuario que creó el proyecto

  service: {
    name: string;
    description: string;
  };
  subCategory: string;
  modality: string;

  title: string;
  description: string;
  urgency?: 'Alta' | 'Media' | 'Baja';
  deadline?: Date;
  references?: string[];

  status: 'Pendiente' | 'En Proceso' | 'Completado';

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Ahora es obligatorio: cada proyecto debe pertenecer a un usuario
    },
    service: {
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    modality: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['Alta', 'Media', 'Baja'],
      default: 'Media',
    },
    deadline: {
      type: Date,
    },
    references: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['Pendiente', 'En Proceso', 'Completado'],
      default: 'Pendiente',
    },
  },
  {
    timestamps: true,
  }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;