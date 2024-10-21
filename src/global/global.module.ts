import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
  providers: [],
  exports: [ClientsModule],
})
export class GlobalModule {}
