import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from '@sendinblue/client';

@Injectable()
export class MailerService {
  private client: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    this.client = new SibApiV3Sdk.TransactionalEmailsApi();
    this.client.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY // store securely in env
    );
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.client.sendTransacEmail({
        sender: { name: 'TalkBase Team', email: 'talkbase.tb@gmail.com' },
        to: [{ email: to }],
        subject,
        textContent: text,
      });
      console.log('Email sent successfully via Brevo API');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email via API', error);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }
}
