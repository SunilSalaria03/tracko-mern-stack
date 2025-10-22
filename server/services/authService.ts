import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as helper from '../helpers/commonHelpers';
import { mailSender } from '../config/sendGrid';
import { SignInInput, SignUpInput, ForgotPasswordInput, ResetPasswordInput, ResetPasswordLinkInput, UserToken } from '../interfaces/commonInterfaces';
import userModel from '../models/userModel';
import { IUser } from '@/interfaces/userInterfaces';
import { AUTH_MESSAGES, USER_MESSAGES, GENERAL_MESSAGES } from '../utils/constants/messages';

export const signInService = async (data: SignInInput) => {
  try {
    const user = await userModel.findOne({ email: data.email, isDeleted: false });
    if (!user) {
      return { error: 'User not registered' };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return { error: 'Password is incorrect' };
    }

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
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

export const signUpService = async (data: Partial<IUser>, files?: any) => {
  try {
    if(data.role == 0) {
      const adminExist = await userModel.findOne({ role: 0, isDeleted: false });
      if (adminExist) {
        return { error: 'Admin already exists' };
      }
    }
    
    const isEmailExist = await userModel.findOne({ 
      email: data.email, 
      isDeleted: false 
    });
    
    if (isEmailExist) {
      return { error: 'Email already exists' };
    }

    if (data.phoneNumber) {
      const isPhoneExist = await userModel.findOne({ 
        phoneNumber: data.phoneNumber, 
        isDeleted: false 
      });
      
      if (isPhoneExist) {
        return { error: 'Phone already exists' };
      }
    }

    let imagePath = '';
    if (files && files.profileImage) {
      imagePath = helper.imageUpload(files.profileImage, 'images');
    }

    // Hash password
    const salt = process.env.SALT_ROUNDS || 12;
    const hashedPassword = await bcrypt.hash(data.password || '', salt);

    const objToCreate = {
      ...data,
      password: hashedPassword,
      profileImage: imagePath,
    };

    const user = await userModel.create(objToCreate);

    // Send welcome email
    // const bgImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/bg.png`;
    // const logoImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/logo.png`;
    
    // const mailData = {
    //   to: data.email,
    //   subject: "Welcome to the Tracko",
    //   html: helper.welcomeHtml(bgImageLink, logoImageLink),
    // };
    
    // await helper.mailSender(mailData);

    const token = jwt.sign(
      { 
        id: user._id, 
        email: data.email, 
      },
      process.env.JWT_SECRET || '123@321',
      { expiresIn: '7d' }
    );

    // Prepare response
    const userInfo = {
      ...user.toObject(),
      password: hashedPassword,
      authToken: token,
    };

    return userInfo;
  } catch (err: any) {
    console.error('Signup service error:', err);
    return { error: err.message || 'Something went wrong' };
  }
};
export const deleteAccountService = async (user: UserToken) => {
  try {
    if (!user || !user.id) {
      return { error: 'User not found' };
    }

    const result = await userModel.findByIdAndDelete(user.id);

    if (!result) {
      return { error: 'User not found' };
    }

    return { message: 'Account deleted successfully' };
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
};

export const logoutService = async (user: UserToken) => {
  try {
    if (!user || !user.id) {
      return { error: 'User not found to logout' };
    }

    const updateResult = await userModel.findByIdAndUpdate(
      user.id,
      {
        deviceToken: '',
        deviceType: '',
      }
    );

    if (!updateResult) {
      return { error: 'Failed to update login time' };
    }

    return { message: 'User Logged Out Successfully' };
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
};

export const forgotPasswordService = async (data: { email: string }) => {
  try {
    const user = await userModel.findOne({
      email: data.email,
      isDeleted: false,
    });
    
    if (!user) {
      return { error: AUTH_MESSAGES.USER_NOT_REGISTERED };
    }

    const generatedString = helper.generateRandomNumbers(6);
    const newToken = helper.encrypt(generatedString);
    const emailOtpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    await userModel.updateOne(
      { email: data.email, isDeleted: false },
      { resetPasswordToken: newToken, emailOtpExpiry: emailOtpExpiryTime }
    );

    const resetPasswordLink = `${
      process.env.CLIENT_BASE_URL || "http://localhost:5173"
    }/reset-password?email=${encodeURIComponent(data.email)}&token=${newToken}`;
    
    const userName = user.name || "Dear User";

    const mailData = {
      to: data.email,
      subject: "Tracko - Reset Password",
      html: helper.resetEmailTemplate(resetPasswordLink, userName),
    };

    try {
      await mailSender(mailData);
      // Always log reset link for development/testing
      console.log("🔗 Password Reset Link:", resetPasswordLink);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // For development: Log the reset link
      console.log("🔗 Password Reset Link:", resetPasswordLink);
    }

    return { message: AUTH_MESSAGES.PASSWORD_RESET_MAIL_SENT };
  } catch (error: any) {
    console.error("Forgot password service error:", error);
    console.error("Error details:", error.message, error.stack);
    return { error: GENERAL_MESSAGES.SOMETHING_WENT_WRONG };
  }
};

export const resetPasswordService = async (data: { encryptedEmail: string; resetPasswordToken: string; password: string }) => {
  try {
    const user = await userModel.findOne({
      email: data.encryptedEmail,
      isDeleted: false,
    });
    
    if (!user) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    const currentTime = Date.now();
    const expiryTime = (user as any).emailOtpExpiry
      ? new Date((user as any).emailOtpExpiry).getTime()
      : 0;

    if (
      expiryTime > currentTime &&
      (user as any).resetPasswordToken === data.resetPasswordToken
    ) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || "12", 10);
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      await userModel.updateOne(
        { email: data.encryptedEmail, isDeleted: false },
        {
          resetPasswordToken: null,
          emailOtpExpiry: null,
          password: hashedPassword,
        }
      );
    } else {
      return { error: AUTH_MESSAGES.TOKEN_EXPIRED };
    }

    return { message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS };
  } catch (error) {
    console.error("Reset password service error:", error);
    return { error: GENERAL_MESSAGES.SOMETHING_WENT_WRONG };
  }
};