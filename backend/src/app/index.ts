import express from 'express';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import chatRouter from './chat/chat.route.js'

import cors from 'cors';
import type { CorsOptions } from 'cors';
import { authRouter } from './auth/route.js';

export function createServerApplication(): Application {
  const app = express();  

  const corsOptions: CorsOptions = {
    origin: '*', // Allow all origins (for development only, consider restricting in production)
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
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
  
  return app;
}