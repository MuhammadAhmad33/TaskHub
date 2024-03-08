import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { jwtConstants } from '../auth/constants';

@Injectable()
export class MailService {
  async sendResetEmail(email: string, resetToken: any) {
    // Create a transporter with the necessary SMTP server configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: jwtConstants.email,
        pass: jwtConstants.password,
      },
    });

    // Define the email options
    const mailOptions = {
      from:jwtConstants.email,
      to: email,
      subject: 'Password Reset',
      text: `To reset your password, please click the following link:http://localhost:3001/todos/forgot-password?token=${resetToken}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  }
}
