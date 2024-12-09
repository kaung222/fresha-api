import { MailerService } from '@nestjs-modules/mailer';
import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueActive,
} from '@nestjs/bull';
import { Job } from 'bull';
import { format } from 'date-fns';
import { Email } from './entities/email.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmailDto } from './dto/crearte-email.dto';

@Processor('emailQueue') // Replace with your queue name
export class EmailQueue {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
  ) {}
  @Process('sendEmail')
  async handleSendEmail({ data }: Job<Email>) {
    this.emailRepository.save(data);
    const { recipientName, subject, text, to } = data;
    return await this.mailerService.sendMail({
      from: process.env.SHOP_GMAIL,
      to,
      subject,
      text: template(recipientName, text),
      html: template(recipientName, text),
    });
  }

  @Process('sendEmailWithoutSaving')
  async handleSendEmailwithourSave({ data }: Job<CreateEmailDto>) {
    console.log(data);
    const { recipientName, subject, text, to } = data;
    return await this.mailerService.sendMail({
      from: process.env.SHOP_GMAIL,
      to,
      subject,
      text: template(recipientName, text),
      html: template(recipientName, text),
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

const template = (recipientName: string, text: string) => {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Innobytex Mailing Service</title>
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
              <h2>Fresha Company Ltd.</h2>
              <p>Yangon Myanmar</p>
              <p>Innobytex.com</p>
              <hr>
              <p>Date: ${format(new Date(), 'yyyy-MM-dd')}</p>
              <p>Dear ${recipientName},</p>
              <p>${text}</p>
          </div>
      </body>
      </html>
    `;
};
