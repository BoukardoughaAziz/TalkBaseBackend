 

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:5173', // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable if you need to handle cookies
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type,Authorization',
  };

  app.enableCors(corsOptions);
  await app.listen(15000);
}
bootstrap();
