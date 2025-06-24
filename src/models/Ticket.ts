import mongoose, { Schema, model, models } from "mongoose";

export interface ITicket {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  description: string;
  status: "open" | "closed";
  client: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    }
  },
  {
    timestamps: true
  }
);

// Evita redefinir el modelo si ya existe (hot reload en dev)
const Ticket = models.Ticket || model<ITicket>("Ticket", TicketSchema);
export default Ticket;