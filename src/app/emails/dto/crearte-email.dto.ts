export class CreateEmailDto {
  to: string | string[];
  text: string;
  subject: string;
  recipientName: string;
  orgId: number;
}
