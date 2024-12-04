import express from 'express';
import fetchRoutes from './routes/fetchRoutes';

const app = express();

// Middleware or other configurations can go here

// Use routes
app.use(fetchRoutes);

export default app;
