import { Schema, model, models, Types } from "mongoose";

const SubscriptionSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: String,
    enum: ["basic","pro","enterprise"],
    default: "basic"
  },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: {
    type: String,
    enum: ["active","past_due","cancelled"],
    default: "active"
  },
  stripeSubscriptionId: String,
  startDate: { type: Date, default: () => new Date() },
  endDate: Date
}, {
  timestamps: true
});

SubscriptionSchema.index({ user: 1, status: 1 });

const Subscription = models.Subscription || model("Subscription", SubscriptionSchema);
export default Subscription;