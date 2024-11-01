import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { swaggerConfig } from './utils/config';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api/v1');
  //swagger start
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/', app, document);
  //compression
  app.use(compression());
  app.enableCors({
    origin: ['http://localhost:4040', 'https://fresha-clone.vercel.app'],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
