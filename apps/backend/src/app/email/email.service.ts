import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

// interface Email {
//   to: string;
//   data: any;
// }

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
}
