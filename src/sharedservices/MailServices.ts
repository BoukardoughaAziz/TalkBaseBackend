import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587, // 587 for STARTTLS, 465 for SSL
      secure: false, // true if using port 465
      auth: {
        user: '988157001@smtp-brevo.com', // Brevo account email
        pass: '61t3SEbaTcyhCY9M',          // Brevo SMTP password/key
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const message = {
      from: '"TalkBase Team" talkbase.tb@gmail.com', // must be verified in Brevo
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(message);
      console.log('E-mail envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail', error);
      throw new Error('Erreur lors de l\'envoi de l\'e-mail');
    }
  }
}
