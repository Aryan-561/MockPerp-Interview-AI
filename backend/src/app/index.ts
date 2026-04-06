import express from 'express';

import type { Application } from 'express';

export function createServerApplication(): Application {
  const app = express();  

  app.get('/health', (req, res) => {
    res.send('connected successfully man!');
  });
  
  return app;
}