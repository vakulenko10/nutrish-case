import express, { Request, Response } from "express";
import { fetchAllData } from "../services/dataFetcher";
import { fetchSpecificData } from "../services/specificDataFetcher";
import { findElementsWithText } from "../services/findElementsWithText";

const router = express.Router();

// Route to fetch all data
router.get("/fetch", async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: "Please provide a query parameter." });
  }

  try {
    const result = await fetchAllData(query);
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/fetch-specific", async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: "Please provide a query parameter." });
  }

  try {
    const result = await fetchSpecificData(query);
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to find elements with specific text
router.get("/find-text", async (req: Request, res: Response) => {
  const query = req.query.query as string;
  const text = req.query.text as string;

  if (!query || !text) {
    return res
      .status(400)
      .json({ error: "Please provide both query and text parameters." });
  }

  try {
    const result = await findElementsWithText(query, text);
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

export default router;
