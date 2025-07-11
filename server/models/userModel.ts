import mongoose, { Schema } from 'mongoose';
import { IUser } from '../helpers/commonInterfaces';

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ['0', '1', '2'], // 0: admin, 1: influencer, 2: brand
      default: '1',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    image: String,
    name: String,
    status: {
      type: String,
      enum: ['1', '0'],
      default: '1',
      required: true,
    },
    phone_number: String,
    country_code: String,
    password: {
      type: String,
      required: true,
    },
    is_otp_verified: {
      type: Boolean,
      default: false,
    },
    loginTime: {
      type: Number,
      default: 0,
      required: true,
    },
    socialId: {
      type: String,
      default: '',
    },
    socialType: {
      type: String,
      enum: ['0', '1', '2', '3'],// 0: default, 1: google, 2: facebook, 3: apple
      default: '0',
    },
    resetPasswordToken: {
      type: String,
      default: '',
    },
    emailOtpExpiry: Date,
    otp: String,
    isDeleted: {
        type: Boolean,
        default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
