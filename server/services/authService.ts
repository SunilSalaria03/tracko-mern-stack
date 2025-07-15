import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as helper from '../helpers/commonHelpers';
import { SignInInput, SignUpInput, ForgotPasswordInput, ResetPasswordInput, ResetPasswordLinkInput, UserToken } from '../helpers/commonInterfaces';
import userModel from '../models/userModel';

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

export const signUpService = async (data: SignUpInput, files?: any) => {
  try {
    // Check if email already exists
    const isEmailExist = await userModel.findOne({ 
      email: data.email, 
      isDeleted: false 
    });
    
    if (isEmailExist) {
      return { error: 'Email already exists' };
    }

    // Check if phone number already exists (if provided)
    if (data.phone_number) {
      const isPhoneExist = await userModel.findOne({ 
        phone_number: data.phone_number, 
        isDeleted: false 
      });
      
      if (isPhoneExist) {
        return { error: 'Phone already exists' };
      }
    }

    // Handle image upload if provided
    let imagePath = '';
    if (files && files.image) {
      imagePath = helper.imageUpload(files.image, 'images');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Prepare user data
    const userData: any = {
      email: data.email,
      password: hashedPassword,
      role: data.role,
    };

    // Add optional fields
    if (data.name) userData.name = data.name;
    if (data.phone_number) userData.phone_number = data.phone_number;
    if (data.country_code) userData.country_code = data.country_code;
    if (imagePath) userData.image = imagePath;
    // Create user
    const user = await userModel.create(userData);

    // Send welcome email
    const bgImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/bg.png`;
    const logoImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/logo.png`;
    
    const mailData = {
      to: data.email,
      subject: "Welcome to the Tracko",
      html: helper.welcomeHtml(bgImageLink, logoImageLink),
    };
    
    await helper.mailSender(mailData);

    // Generate JWT token
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
        loginTime: 0, 
        authToken: '', 
        device_token: '' 
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

export const forgotPasswordService = async (data: ForgotPasswordInput) => {
  try {
    const user = await userModel.findOne({
      email: data.email,
      isDeleted: false
    });

    if (!user) {
      return { error: 'User not registered' };
    }

    const generatedString = helper.generateRandomNumbers(6);
    const newToken = helper.encrypt(generatedString);
    const emailOtpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    await userModel.updateOne(
      { email: data.email, isDeleted: false },
      { 
        resetPasswordToken: newToken, 
        emailOtpExpiry: emailOtpExpiryTime 
      }
    );

    const bgImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/bg.png`;
    const logoImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/logo.png`;
    const resetPasswordLink = `${process.env.BASE_URL}/api/reset_password_link?email=${data.email}&token=${newToken}`;
    
    const userName = user.name || 'Dear User';

    const mailData = {
      to: data.email,
      subject: 'Reset Password Link',
      html: helper.resetPasswordHtml(resetPasswordLink, logoImageLink, bgImageLink, userName),
    };

    await helper.mailSender(mailData);

    return { message: 'Mail sent successfully' };
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
};

export const resetPasswordService = async (data: ResetPasswordInput | ResetPasswordLinkInput) => {
  try {
    if ('token' in data && 'email' in data && !('password' in data)) {
      const user = await userModel.findOne({ 
        email: data.email, 
        isDeleted: false 
      });

      if (!user) {
        return { error: 'User not found' };
      }

      const currentTime = Date.now();
      const expiryTime = user.emailOtpExpiry ? new Date(user.emailOtpExpiry).getTime() : 0;

      if (expiryTime > currentTime && user.resetPasswordToken === data.token) {
        await userModel.updateOne(
          { email: data.email, isDeleted: false },
          { resetPasswordToken: null, emailOtpExpiry: null }
        );
        return { message: 'Token verified successfully' };
      } else {
        return { error: 'Token expired or invalid' };
      }
    }

    // Handle password reset
    if ('password' in data && 'email' in data && 'tokenFound' in data) {
      const user = await userModel.findOne({ 
        email: data.email, 
        isDeleted: false 
      });

      if (!user) {
        return { error: 'User not registered' };
      }

      const expiryTime = user.emailOtpExpiry ? new Date(user.emailOtpExpiry).getTime() : 0;
      
      if (user.resetPasswordToken !== data.tokenFound || expiryTime < Date.now()) {
        return { error: 'Invalid or expired token' };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      await userModel.updateOne(
        { email: data.email, isDeleted: false },
        { 
          password: hashedPassword, 
          resetPasswordToken: null, 
          emailOtpExpiry: null 
        }
      );

      return { message: 'Password reset successfully' };
    }

    return { error: 'Invalid request data' };
  } catch (err: any) {
    return { error: err.message || 'Something went wrong' };
  }
};
