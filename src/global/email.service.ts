import { MailerService } from '@nestjs-modules/mailer';
import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueActive,
} from '@nestjs/bull';
import { Job } from 'bull';

export class SendEmailDto {
  to: string;
  text: string;
  subject: string;
}

@Processor('send-email') // Replace with your queue name
export class EmailService {
  constructor(private mailerService: MailerService) {}
  @Process('sendEmail')
  async handleSendEmail({ data }: Job<SendEmailDto>) {
    console.log('sendmail :' + data.subject);
    return await this.mailerService.sendMail({
      from: process.env.SHOP_GMAIL,
      to: data.to,
      subject: data.subject,
      text: template(data.text),
      html: template(data.text),
    });
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log(`done all jobs!`);
  }
}

const template = (otp: string) => {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mailing Service</title>
          <style>
    
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 0 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <img src="https://yourcompanylogo.com/logo.png" alt="Your Company Logo" style="max-width: 100%;">
              <h2>Your Company Name</h2>
              <p>Your Company Address</p>
              <p>Phone Number: [Your Phone Number]</p>
              <p>Email: [Your Email Address]</p>
              <p>Website: [Your Website URL]</p>
              <hr>
              <p>Date: [Current Date]</p>
              <p>Recipient's Name: [Recipient's Name]</p>
              <p>Recipient's Address: [Recipient's Address]</p>
              <p>Dear [Recipient's Name],</p>
              <p>We're thrilled to introduce our reliable and efficient mailing services tailored to meet your needs. At [Your Company Name], we understand the importance of timely and secure deliveries, which is why we're committed to providing top-notch service to our valued customers.</p>
              <p>Our mailing services include:</p>
              <ul>
                  <li>Domestic and International Shipping</li>
                  <li>Express Delivery</li>
                  <li>Parcel Tracking</li>
                  <li>Custom Packaging Solutions</li>
              </ul>
              <h5>Your OTP for BurmeseZay.com is ${otp}</h5>
          </div>
      </body>
      </html>
    `;
};
