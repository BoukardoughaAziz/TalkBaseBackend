 

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify'; 
import { AppModule } from './app-module';
 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const corsOptions: CorsOptions = {
    origin: '*', // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable if you need to handle cookies
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type,Authorization',
  };
  app.setGlobalPrefix('NwidgetBackend');
  app.enableCors(corsOptions);
  await app.listen(15000);
}
bootstrap();
