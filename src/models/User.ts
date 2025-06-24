import { Schema, model, models, Model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  lastname?: string;
  company?: string;
  agencyName?: string;
  subdomain?: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
  provider: 'credentials' | 'google' | 'github';
  phone?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  hasValidPaymentMethod?: boolean;
  stripeCustomerId?: string | null;
  stripeAccountId?: string | null;
  stripeAccountStatus?: 'pending' | 'verified' | 'rejected' | 'disabled';
  paymentMethodDetails?: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
  avatar?: string;
  bio?: string;
  language?: string;
  otherLanguages?: {
    code: string;
    level: string;
  }[];
  category?: string;
  services?: string[];
  location?: string;
  teamSize?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
  };
  theme?: 'light' | 'dark';
  currency?: string;
  timezone?: string;
  settings?: Record<string, unknown>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    lastname:     { type: String, trim: true },
    company:      { type: String, trim: true },
    agencyName:   { type: String, trim: true },
    subdomain:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String },
    role:         {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    provider:     {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    phone:               { type: String },
    isPhoneVerified:     { type: Boolean, default: false },
    isEmailVerified:     { type: Boolean, default: false },
    hasValidPaymentMethod: { type: Boolean, default: false },
    stripeCustomerId:    { type: String, default: null },
        stripeAccountId:     { type: String, default: null },
    stripeAccountStatus: {
    type: String,
      enum: ['pending', 'verified', 'rejected', 'disabled'],
      default: 'pending',
    },
    paymentMethodDetails: {
      last4:     { type: String },
      brand:     { type: String },
      exp_month: { type: Number },
      exp_year:  { type: Number },
    },
    avatar:              { type: String },
    bio:                 { type: String },
    language:            { type: String },
    otherLanguages:      {
      type: [
        {
          code:  { type: String, required: true },
          level: { type: String, required: true },
        },
      ],
      default: [],
    },

    category:   { type: String },
    services:   { type: [String], default: [] },
    location:   { type: String },
    teamSize:   { type: String },

    notifications: {
      email: { type: Boolean, default: true },
      sms:   { type: Boolean, default: false },
    },
    theme:               { type: String, enum: ['light', 'dark'], default: 'light' },
    currency: { type: String },
    timezone: { type: String },
    settings:            { type: Schema.Types.Mixed },
    resetPasswordToken:  { type: String },
    resetPasswordExpires:{ type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Evitar errores de recarga en desarrollo:
const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);
export default User;
