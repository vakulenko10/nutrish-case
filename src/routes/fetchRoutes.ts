import express, { Request, Response } from "express";
import { fetchDataWithSuggestions } from "../services/fetchDataWithSuggestions";

const router = express.Router(); // Create an Express router instance for handling API routes

// Route: /fetch-dynamically
// Description: Fetch data dynamically and provide suggestions if the query is not found using `fetchDataWithSuggestions`.
router.get('/fetch-dynamically', async (req: Request, res: Response) => {
  const query = req.query.query as string; // Extract the "query" parameter
  const fields = req.query.fields ? (req.query.fields as string).split(',') : undefined; // Parse "fields" into an array
  const summary = req.query.summary === 'true'; // Convert "summary" to a boolean
  const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string, 10) : undefined; // Parse "maxResults" as a number

  // Validate the required parameter "query"
  if (!query) {
    return res.status(400).json({ error: 'Please provide a query parameter.' }); // Return an error if query is missing
  }

  try {
    const result = await fetchDataWithSuggestions(query, fields, summary, maxResults); // Call the dynamic fetch function to retrieve data
    res.json(result); // Return the fetched data and suggestions as a JSON response
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`); // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' }); // Return a server error response
  }
});

// Route: /health
// Description: Health check endpoint to verify the API is running.
router.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK"); // Return a 200 status with "OK" to indicate the server is healthy
});

export default router; // Export the router to use in the main server file
