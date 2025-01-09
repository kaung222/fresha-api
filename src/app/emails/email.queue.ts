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
import { SendEmailToAdmin } from './dto/send-email-to-admin';
import { CreateEmailBySystem } from './dto/crearte-email.dto';

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
    const { subject, text, to } = data;
    return await this.mailerService.sendMail({
      from: process.env.SHOP_GMAIL,
      to,
      subject,
      text: template(text),
      html: template(text),
    });
  }

  @Process('sendEmailToAdmin')
  async sendEmailToAdmin({ data }: Job<SendEmailToAdmin>) {
    await this.mailerService.sendMail({
      from: data.from,
      to: 'thirdgodiswinning@gmail.com',
      subject: data.subject,
      text: template(data.text),
      html: template(data.text),
    });
  }

  @Process('sendEmailWithoutSaving')
  async handleSendEmailwithourSave({ data }: Job<CreateEmailBySystem>) {
    const { subject, text, to, from } = data;
    return await this.mailerService.sendMail({
      from,
      to,
      subject,
      html: template(text),
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

const template = (text: string) => {
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
                  .content{
                  font-size: 13px}
          </style>
      </head>
      <body>
          <div class="container">
              <img src="https://djiwkc53pq2w8.cloudfront.net/user_1_24a33f1a-b683-40d1-8601-d01c0a920b65_INBX_IMG.png" alt="Baranie company logo" style="max-width: 100%;">
              <h2>Baranie.com Company Ltd.</h2>
              <p>Yangon, Myanmar.</p>
              <a href="https://baranie.com">Baranie.com</a>
              <hr>
              <p>Date: ${format(new Date(), 'yyyy-MM-dd')}</p>
              <div class="content">${text}</div>
              <footer><h5>Thank you for being part of Baranie.</h5></footer>
          </div>
      </body>
      </html>
    `;
};
