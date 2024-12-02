import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

const app = express();
const port = 5000;

// Puppeteer function to fetch and parse Examine data
async function fetchExamineData(query: string): Promise<object> {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = `https://examine.com/supplements/${query.toLowerCase()}/`;
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const pageTitle = await page.title();
    if (pageTitle === '404') {
      throw new Error(`No data found for the query: "${query}".`);
    }

    // Get the page HTML content
    const html = await page.content();

    // Debugging: Log the HTML content to check if it's loaded
    console.log("HTML Content Loaded");

    // Ensure HTML content is available
    if (!html) {
      throw new Error("Failed to retrieve HTML content from the page.");
    }

    // Use Cheerio to parse the HTML and extract the <main> tag content
    const $ = cheerio.load(html);
    const mainContent = $('main').html()?.trim() || 'No <main> content available';

    // Return the extracted <main> content
    await browser.close();
    return {
      query,
      mainContent,
    };
  } catch (error: any) {
    return { error: `An error occurred: ${error.message}` };
  }
}


// Define the route with the correct types
app.get('/fetch', async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: 'Please provide a query parameter.' });
  }

  const result = await fetchExamineData(query);
  return res.json(result);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
