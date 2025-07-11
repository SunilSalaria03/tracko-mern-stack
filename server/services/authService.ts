import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as helper from '../helpers/commonHelpers';
import { SignInInput } from '../helpers/commonInterfaces';
import userModel from '../models/userModel';

export const signInService = async (data: SignInInput) => {
  try {
    const user = await userModel.findOne({ email: data.email, deletedAt: null });
    if (!user) {
      return { error: 'User not registered' };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return { error: 'Password is incorrect' };
    }

    user.loginTime = helper.unixTimestamp();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        loginTime: user.loginTime,
      },
      process.env.JWT_SECRET || '123@321',
      { expiresIn: '7d' }
    );

    const userResponse = {
      ...user.toObject(),
      authToken: token,
    };

    return userResponse;
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
};
