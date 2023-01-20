import * as fs from 'fs';
import handlebars from 'handlebars';
import { createTransport } from 'nodemailer';
import { EmailDto } from '../dtos/email.dto';

export async function sendEmail(payload: EmailDto): Promise<void> {
  const html = fs.readFileSync('./public/templates/email.html', 'utf-8');
  const template = handlebars.compile(html);

  const smtpTransport = await createTransport({
    port: Number(process.env.MAIL_PORT),
    host: process.env.MAIL_HOST,
    from: process.env.MAIL_FROM,
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Blogs <${process.env.MAIL_FROM}>`,
    to: payload.emailTo,
    subject: 'henlo',
    html: template(payload),
  };

  await smtpTransport.sendMail(mailOptions);
}
