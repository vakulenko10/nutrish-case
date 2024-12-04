import express, { Request, Response } from 'express';
import { fetchAllData } from '../services/dataFetcher';

const router = express.Router();

// Route to fetch all data
router.get('/fetch', async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: 'Please provide a query parameter.' });
  }

  try {
    const result = await fetchAllData(query);
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

export default router;
