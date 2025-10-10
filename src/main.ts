import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Allowed origins (frontend URLs)
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
        'https://talkbasee.netlify.app',
        'https://talkbasefrontoffice-yrcs.onrender.com'
      ];

  // ✅ Proper CORS configuration for cookie-based authentication
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or mobile)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('❌ Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true, // ✅ This is CRUCIAL for cookies
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['set-cookie'], // ✅ Allow browser to handle cookies properly
    optionsSuccessStatus: 204,
  };

  // ✅ Global prefix (keep it if needed)
  app.setGlobalPrefix('NwidgetBackend');

  // ✅ Enable CORS before cookie parser
  app.enableCors(corsOptions);

  // ✅ Parse cookies on incoming requests
  app.use(cookieParser());

  // ✅ Listen on all network interfaces (for Render)
  await app.listen(process.env.PORT || 15000, '0.0.0.0');

  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
