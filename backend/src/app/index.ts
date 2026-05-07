import express from 'express';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import chatRouter from './chat/chat.route.js'

import cors from 'cors';
import type { CorsOptions } from 'cors';
import { authRouter } from './auth/route.js';
import { uploadRouter } from './upload/upload.route.js';

export function createServerApplication(): Application {
  const app = express();  

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    // add production URL here when deploying
  ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true, // required for cookie-based auth
  };

  app.use(cors(corsOptions));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(express.json({limit:"24kb"}))
  app.use(cookieParser())

  app.get('/api/health', (req, res) => {
    res.send('connected successfully man!');
  });


  app.use('/api/chat', chatRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/upload', uploadRouter)
  return app;
}