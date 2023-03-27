import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import handlebars from 'handlebars';
import { createTransport } from 'nodemailer';
import { IUser } from 'src/model/interfaces/user.interface';

type AuthEmailType = 'activation-code' | 'password-recovery' | 'signup';
class AuthEmailData {
  subject: string;
  greet: string;
  textRequest: string;
  textAction: string;
  code: number;
}

@Injectable()
export class EmailService {
  private recipient: string;
  private emailData: AuthEmailData;

  public async sendAuthEmail(user: IUser, type: AuthEmailType) {
    this.recipient = user.email;

    const emailData = new AuthEmailData();
    emailData.greet = `Hello ${user.firstName} ${user.lastName}.`;

    switch (type) {
      case 'signup':
        emailData.code = user.activationCode;
        emailData.subject = 'Account created';
        emailData.textRequest = 'You have successfully created a new account.';
        emailData.textAction = 'Please, use the following code to activate it.';
        break;
      case 'activation-code':
        emailData.code = user.activationCode;
        emailData.subject = 'Activation code';
        emailData.textRequest =
          'You have requested your account activation code.';
        emailData.textAction =
          'Please, use the following code to activate your account.';
        break;
      case 'password-recovery':
        emailData.code = user.passwordRecoveryCode;
        emailData.subject = 'Password reset code';
        emailData.textRequest = 'You have requested to set a new password.';
        emailData.textAction = 'Please, use the following code to do so.';
        break;
    }

    this.emailData = emailData;
    await this.sendEmail();
  }

  private async sendEmail(): Promise<void> {
    const template = fs.readFileSync(
      `${__dirname}/templates/auth.template.html`,
      'utf-8',
    );
    const compiledTemplate = handlebars.compile(template);

    const smtpTransport = await createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Selfieboost<${process.env.MAIL_FROM}>`,
      to: this.recipient.toLowerCase(),
      subject: this.emailData.subject,
      html: compiledTemplate(this.emailData),
    };

    await smtpTransport.sendMail(mailOptions);
  }
}
