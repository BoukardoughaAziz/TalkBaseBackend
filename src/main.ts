 

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify'; 
import { AppModule } from './app-module';
import { readFileSync } from 'fs';
 

async function bootstrap() {
  const httpsOptions = {
    https: {
      key: readFileSync('../certificate3/example.com+5-key.pem'),
      cert: readFileSync('../certificate3/example.com+5.pem'),
    },
  };

  const app = await NestFactory.create(AppModule, new FastifyAdapter(httpsOptions));
  
  const corsOptions: CorsOptions = {
    origin: '*', // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable if you need to handle cookies
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type,Authorization',
  };
  
  app.setGlobalPrefix('NwidgetBackend');
  app.enableCors(corsOptions);
  await app.listen(15000, '0.0.0.0');
}

bootstrap();
