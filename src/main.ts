import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:55555',
        'http://localhost:5173',
        'http://192.168.0.106:55555',
        'https://timely-hamster-68076f.netlify.app',
        'https://talkbasebackend.onrender.com',
        'https://68e21c8de7ed3887b7dacdc1--talkbase.netlify.app',
        'https://talkbase.netlify.app',
        'https://talkbasee.netlify.app'
        // Add your Render backend URL if frontend needs to call it
      ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,  // true =>> Allow cookies to be sent
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.setGlobalPrefix('NwidgetBackend');
  app.enableCors(corsOptions);
  
  await app.listen(15000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();