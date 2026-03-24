import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Clinic Appointment Booking API root endpoint.',
  });
});

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
