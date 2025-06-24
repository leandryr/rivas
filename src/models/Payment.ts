import { Schema, model, models, Types } from "mongoose";

const PaymentSchema = new Schema({
  invoice:      { type: Types.ObjectId, ref: "Invoice" },
  subscription: { type: Types.ObjectId, ref: "Subscription" },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: "USD" },
  method:       { type: String, enum: ["stripe","paypal","manual"], required: true },
  transactionId:{ type: String },
  status:       { type: String, enum: ["succeeded","failed","pending"], default: "pending" },
  paidAt:       { type: Date }
}, {
  timestamps: true
});

PaymentSchema.index({ invoice: 1 });
PaymentSchema.index({ subscription: 1 });

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;