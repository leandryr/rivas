import mongoose, { Schema, model, models } from "mongoose";

export interface ITicketMessage {
  _id: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  sender: "admin" | "client";
  message: string;
  createdAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,  // <-- aquí
      ref: "Ticket",
      required: true
    },
    sender: {
      type: String,
      enum: ["admin", "client"],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const TicketMessage =
  models.TicketMessage ||
  model<ITicketMessage>("TicketMessage", TicketMessageSchema);

export default TicketMessage;