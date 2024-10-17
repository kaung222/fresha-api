import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3001,
          host: 'localhost',
        },
      },
    ]),
  ],
  exports: [ClientsModule],
  providers: [EmailService],
})
export class GlobalModule {}
