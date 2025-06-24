// models/Task.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITask extends Document {
  assignedTo: Types.ObjectId;   // Usuario al que se asigna la tarea
  projectId: Types.ObjectId;    // Proyecto asociado a la tarea
  title: string;
  description?: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado';
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId:  { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title:      { type: String, required: true, trim: true },
    description:{ type: String, trim: true },
    status: {
      type: String,
      enum: ['Pendiente', 'En Proceso', 'Completado'],
      default: 'Pendiente',
    },
  },
  { timestamps: true }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export default Task;
