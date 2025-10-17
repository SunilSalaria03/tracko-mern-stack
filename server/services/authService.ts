import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as helper from '../helpers/commonHelpers';
import { SignInInput, SignUpInput, ForgotPasswordInput, ResetPasswordInput, ResetPasswordLinkInput, UserToken } from '../interfaces/commonInterfaces';
import userModel from '../models/userModel';
import { IUser } from '@/interfaces/userInterfaces';

export const signInService = async (data: SignInInput) => {
  try {
    const user = await userModel.findOne({ email: data.email, isDeleted: false });
    if (!user) {
      return { error: 'User not registered' };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    console.log(passwordMatch)
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

// export const forgotPasswordService = async (data: ForgotPasswordInput) => {
//   try {
//     const user = await userModel.findOne({
//       email: data.email,
//       isDeleted: false
//     });

//     if (!user) {
//       return { error: 'User not registered' };
//     }

//     const generatedString = helper.generateRandomNumbers(6);
//     const newToken = helper.encrypt(generatedString);
//     const emailOtpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

//     await userModel.updateOne(
//       { email: data.email, isDeleted: false },
//       { 
//         resetPasswordToken: newToken, 
//         emailOtpExpiry: emailOtpExpiryTime 
//       }
//     );

//     const bgImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/bg.png`;
//     const logoImageLink = `${process.env.BASE_URL}/app-assets/images/email_templates/logo.png`;
//     const resetPasswordLink = `${process.env.BASE_URL}/api/reset_password_link?email=${data.email}&token=${newToken}`;
    
//     const userName = user.name || 'Dear User';

//     const mailData = {
//       to: data.email,
//       subject: 'Reset Password Link',
//       html: helper.resetPasswordHtml(resetPasswordLink, logoImageLink, bgImageLink, userName),
//     };

//     await helper.mailSender(mailData);

//     return { message: 'Mail sent successfully' };
//   } catch (err: any) {
//     return { error: err.message || 'Something went wrong' };
//   }
// };

// export const resetPasswordService = async (data: ResetPasswordInput | ResetPasswordLinkInput) => {
//   try {
//     if ('token' in data && 'email' in data && !('password' in data)) {
//       const user = await userModel.findOne({ 
//         email: data.email, 
//         isDeleted: false 
//       });

//       if (!user) {
//         return { error: 'User not found' };
//       }

//       const currentTime = Date.now();
//       const expiryTime = user.emailOtpExpiry ? new Date(user.emailOtpExpiry).getTime() : 0;

//       if (expiryTime > currentTime && user.resetPasswordToken === data.token) {
//         await userModel.updateOne(
//           { email: data.email, isDeleted: false },
//           { resetPasswordToken: null, emailOtpExpiry: null }
//         );
//         return { message: 'Token verified successfully' };
//       } else {
//         return { error: 'Token expired or invalid' };
//       }
//     }

//     // Handle password reset
//     if ('password' in data && 'email' in data && 'tokenFound' in data) {
//       const user = await userModel.findOne({ 
//         email: data.email, 
//         isDeleted: false 
//       });

//       if (!user) {
//         return { error: 'User not registered' };
//       }

//       const expiryTime = user.emailOtpExpiry ? new Date(user.emailOtpExpiry).getTime() : 0;
      
//       if (user.resetPasswordToken !== data.tokenFound || expiryTime < Date.now()) {
//         return { error: 'Invalid or expired token' };
//       }

//       const hashedPassword = await bcrypt.hash(data.password, 10);
      
//       await userModel.updateOne(
//         { email: data.email, isDeleted: false },
//         { 
//           password: hashedPassword, 
//           resetPasswordToken: null, 
//           emailOtpExpiry: null 
//         }
//       );

//       return { message: 'Password reset successfully' };
//     }

//     return { error: 'Invalid request data' };
//   } catch (err: any) {
//     return { error: err.message || 'Something went wrong' };
//   }
// };
