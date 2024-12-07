export class SendEmailDto {
  to: string | string[];
  text: string;
  subject: string;
  recipientName: string;
}
