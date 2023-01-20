export class EmailDto {
  caller:
    | 'auth.signup'
    | 'auth.send-activation-code'
    | 'auth.send-password-recovery-code';
  emailTo: string;
  userFirstName: string;
  userLastName: string;
  subject: string;
  code: number;
}
