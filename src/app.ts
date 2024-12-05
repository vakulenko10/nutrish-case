import express from 'express';
import fetchRoutes from './routes/fetchRoutes';

const app = express();

app.use(fetchRoutes);

export default app;
