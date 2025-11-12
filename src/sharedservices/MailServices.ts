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


 async sendMarketingEmail(
  recipients: string[], // Changed from { email: string }[] to string[]
  subject: string,
  text: string,
  html?: string
) {
  console.log('marketing mails has started');
  console.log("this is the recipients", recipients);
  console.log("this is the subject", subject);
  console.log("this is the text", text);
  console.log("this is the html", html);
  
  try {
    if (!recipients || recipients.length === 0) {
      console.warn('⚠️ Aucun destinataire fourni.');
      return { success: false, message: 'Aucun destinataire fourni.' };
    }

    // ✅ Transform string array to Brevo format
    const formattedRecipients = recipients.map(email => ({ email }));
    
    console.log(`📧 Envoi d'un email marketing à ${formattedRecipients.length} destinataires...`);
    console.log("Formatted recipients:", formattedRecipients);
    
    // ✅ Send email via Brevo API
    const response = await this.client.sendTransacEmail({
      sender: { name: 'TalkBase Team', email: 'talkbase.tb@gmail.com' },
      to: formattedRecipients, // Now properly formatted
      subject,
      textContent: text,
      htmlContent: html || `<p>${text}</p>`,
      headers: {
        'X-Mailer-Category': 'Marketing',
        'X-App': 'TalkBase',
      },
    });

    console.log('✅ Email(s) envoyés avec succès à:');
    formattedRecipients.forEach(r => console.log(`- ${r.email}`));
    console.log('📨 Réponse Brevo API:', response);
    
    return { success: true, count: formattedRecipients.length, response };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email via Brevo API:', error.message);
    if (error.response?.body) {
      console.error('📋 Détails API:', error.response.body);
    }
    throw new Error('Erreur lors de l\'envoi de l\'email — veuillez réessayer.');
  }
}

}
