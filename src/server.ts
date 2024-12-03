import express, { Request, Response } from 'express';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const app = express();
const port = 5000;

// Function to fetch all data using @sparticuz/chromium
async function fetchAllData(query: string): Promise<object> {
  const url = `https://examine.com/supplements/${query.toLowerCase()}/`;

  let browser = null;
  try {
    // Launch Puppeteer with the serverless-compatible Chromium
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const elementsWithId = await page.$$eval('[id]', (elements: Element[]) => {
      const result: { [key: string]: string } = {};
      elements.forEach((element) => {
        const id = (element as HTMLElement).id;
        const textContent = element.textContent?.trim() || 'No text content available';
        if (id) {
          result[id] = textContent;
        }
      });
      return result;
    });

    return { query, elementsWithId };
  } catch (error: any) {
    console.error(`Error while fetching data: ${error.message}`);
    return { error: `An error occurred: ${error.message}` };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Route to fetch all data
app.get('/fetch', async (req: Request, res: Response) => {
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
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
