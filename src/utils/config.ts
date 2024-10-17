import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TypeOrmOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process?.env.MYSQL_HOST,
  port: +process?.env.MYSQL_PORT,
  username: process?.env.MYSQL_USER,
  password: process?.env.MYSQL_PASSWORD,
  database: process?.env.MYSQL_DATABASE,
  synchronize: true,
  logging: true,
  autoLoadEntities: true,
  //   entities: [User],
};

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Beauty appointment app')
  .setDescription('Beauty appointmennts api ')
  .setVersion('0.0.1')
  .build();
