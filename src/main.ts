 

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify'; 
import { AppModule } from './app-module';
import { readFileSync } from 'fs';
 

async function bootstrap() {
  const httpsOptions = {
    // https: {
    //   key: readFileSync('../certificate3/example.com+5-key.pem'),
    //   cert: readFileSync('../certificate3/example.com+5.pem'),
    // },
  };

    const app = await NestFactory.create(AppModule); // this defaults to Express
  
    const corsOptions: CorsOptions = {
      origin: ['http://192.168.0.106:55555','http://localhost:55555','http://localhost:5173','https://courageous-druid-d2f376.netlify.app','talkbase-widget.umd.js:40','https://timely-hamster-68076f.netlify.app'], // ← Your frontend's IP + port
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204,
      allowedHeaders: 'Content-Type,Authorization',
    };


  //old one doesn't work when credientials are true the origin cannot be *:  
  //   const corsOptions: CorsOptions = {
  //   origin: '*', // Allow only this origin
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true, // true =>> Allow cookies to be sent
  //   optionsSuccessStatus: 204,
  //   allowedHeaders: 'Content-Type,Authorization',
  // };

  app.setGlobalPrefix('NwidgetBackend');
  app.enableCors(corsOptions);
  await app.listen(15000, '0.0.0.0');
}

bootstrap();
