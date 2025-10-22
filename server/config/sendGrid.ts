import sgMail from '@sendgrid/mail';
import { IMailData } from '../interfaces/commonInterfaces';
import dotenv from 'dotenv';
import path from 'path';
 
dotenv.config({
  path: path.resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`
  ),
});

// Initialize SendGrid with API key if available
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const mailSender = async (mailData: IMailData): Promise<boolean> => {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('⚠️  SendGrid not configured. Email will not be sent.');
        console.log('📧 Email Preview:');
        console.log('   To:', mailData.to);
        console.log('   Subject:', mailData.subject);
        console.log('   From:', process.env.SENDGRID_FROM_EMAIL || 'noreply@tracko.com');
        return true; // Return true to allow development without email
      }
  
      const msg = {
        to: mailData.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@tracko.com',
        subject: mailData.subject,
        text: mailData.text,
        html: mailData.html,
      };
  
      await sgMail.send(msg);
      console.log('✅ Email sent successfully to:', mailData.to);
      return true;
    } catch (error: any) {
      console.error('❌ SendGrid Error:', error.response?.body || error.message || error);
      return false;
    }
  };