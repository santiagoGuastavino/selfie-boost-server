import * as fs from 'fs';
import handlebars from 'handlebars';
import { createTransport } from 'nodemailer';

type Template = 'auth';
type Caller =
  | 'auth.signup'
  | 'auth.send-activation-code'
  | 'auth.send-password-recovery-code';
type Subject = 'Account created' | 'Activation code' | 'Password reset code';

class EmailData {
  greet: string;
  textRequest: string;
  textAction: string;
  code: number;
}

export class MailerService {
  public caller: Caller;
  public recipientEmail: string;
  public recipientFirstName: string;
  public recipientLastName: string;
  public code: number;

  private subject: Subject;
  private template: Template;

  constructor(
    caller?: Caller,
    recipientEmail?: string,
    recipientFirstName?: string,
    recipientLastName?: string,
    code?: number,
  ) {
    this.caller = caller;
    this.recipientEmail = recipientEmail;
    this.recipientFirstName = recipientFirstName;
    this.recipientLastName = recipientLastName;
    this.code = code;
  }

  public async sendEmail(): Promise<void> {
    const emailData: EmailData = this.setUpEmailData();

    const template = fs.readFileSync(
      `${__dirname}/templates/${this.template}.template.html`,
      'utf-8',
    );

    const compiledTemplate = handlebars.compile(template);

    const smtpTransport = await createTransport({
      host: process.env.MAIL_HOST,
      from: process.env.MAIL_FROM,
      auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Nestjs Application<${process.env.MAIL_FROM}>`,
      to: this.recipientEmail,
      subject: this.subject,
      html: compiledTemplate(emailData),
    };

    await smtpTransport.sendMail(mailOptions);
  }

  private setUpEmailData(): EmailData {
    const emailData = new EmailData();

    if (this.caller.includes('auth')) {
      this.template = 'auth';

      emailData.code = this.code;
      emailData.greet = `Hello ${this.recipientFirstName} ${this.recipientLastName}.`;

      if (this.caller === 'auth.signup') {
        this.subject = 'Account created';

        emailData.textRequest = 'You have successfully created a new account.';
        emailData.textAction = 'Please, use the following code to activate it.';
      } else if (this.caller === 'auth.send-activation-code') {
        this.subject = 'Activation code';

        emailData.textRequest =
          'You have requested your account activation code.';
        emailData.textAction =
          'Please, use the following code to activate your account.';
      } else if (this.caller === 'auth.send-password-recovery-code') {
        this.subject = 'Password reset code';

        emailData.textRequest = 'You have requested to set a new password.';
        emailData.textAction = 'Please, use the following code to do so.';
      }
    }

    return emailData;
  }
}
