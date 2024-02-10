import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.interface';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /*
   * This method sends a welcome email to the user.
   * needed context:
   * - title: The title of the email.
   * - date: The date the email was sent.
   * - firstName: The first name of the user.
   * - domainName: The domain of the application.
   * - email: The email of the user.
   */
  async welcomeEmail(data) {
    const { email, name } = data;

    const subject = `Welkom bij de zorgplanner!`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './welcome',
      context: {
        name,
      },
    });
  }

  /*
   * This method sends an OTP to the user's email address.
   * needed context:
   * - title: The title of the email.
   * - date: The date the email was sent.
   * - firstName: The first name of the user.
   * - otp: The OTP.
   * - domainName: The domain of the application.
   */
  sendOtpEmail(email: string, user: User, otp: string) {
    const subject = `Inlogcode: ${otp}`;

    if (process.env.NODE_ENV === 'local') {
      console.log('Otp:', otp);
      return Promise.resolve();
    }

    const title = 'Inlogcode';
    const date = new Date().toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const firstName = user.name;
    const domainName = 'change me';

    return this.mailerService.sendMail({
      to: email,
      subject,
      template: './otp',
      context: {
        title,
        date,
        firstName,
        otp,
        domainName,
      },
    });
  }
}
