// src/models/User.ts
import { Schema, model, models, Model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  lastname?: string;
  company?: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
  provider: 'credentials' | 'google' | 'github';
  phone?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  hasValidPaymentMethod?: boolean; // <-- nuevo campo
  avatar?: string;
  bio?: string;
  language?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
  };
  theme?: 'light' | 'dark';
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    lastname: { type: String, trim: true },
    company:  { type: String, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role:     {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    phone:             { type: String },
    isPhoneVerified:   { type: Boolean, default: false },
    isEmailVerified:   { type: Boolean, default: false },
    hasValidPaymentMethod: { type: Boolean, default: false }, // <-- nuevo campo con default
    avatar:            { type: String },
    bio:               { type: String },
    language:          { type: String },
    notifications:     {
      email: { type: Boolean, default: true },
      sms:   { type: Boolean, default: false },
    },
    theme:             { type: String, enum: ['light', 'dark'], default: 'light' },
    settings:          { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Evitar errores de recarga en desarrollo:
const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);
export default User;
