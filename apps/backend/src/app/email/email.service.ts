import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async welcomeEmail(data) {
    const { email, name } = data;

    const subject = `Welcome to Company: ${name}`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './welcome',
      context: {
        name,
      },
    });
  }

  sendOtpEmail(email: string, otp: string) {
    const subject = `Inlogcode: ${otp}`;

    if (process.env.NODE_ENV === 'local') {
      console.log('Otp:', otp);
      return Promise.resolve();
    }

    return this.mailerService.sendMail({
      to: email,
      subject,
      template: './otp',
      context: {
        otp,
      },
    });
  }
}
