import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { swaggerConfig } from './utils/config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //swagger start
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  //compression
  app.use(compression());
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}
bootstrap();
