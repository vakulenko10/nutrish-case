import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use Puppeteer Stealth Plugin to avoid detection
puppeteer.use(StealthPlugin());

const app = express();
const port = 5000;

// Function to fetch all data
async function fetchAllData(query: string): Promise<object> {
  const url = `https://examine.com/supplements/${query.toLowerCase()}/`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

    await browser.close();
    return { query, elementsWithId };
  } catch (error: any) {
    console.error(`Error while fetching data: ${error.message}`);
    return { error: `An error occurred: ${error.message}` };
  }
}

// Function to fetch data matching description
async function fetchDataWithDescription(query: string, description: string): Promise<object> {
  const url = `https://examine.com/supplements/${query.toLowerCase()}/`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

    const elementsWithId = await page.$$eval('[id]', (elements: Element[], keyword: string) => {
      const result: { [key: string]: string } = {};
      elements.forEach((element) => {
        const id = (element as HTMLElement).id;
        const textContent = element.textContent?.trim();
        if (id && textContent && textContent.toLowerCase().includes(keyword.toLowerCase())) {
          result[id] = textContent;
        }
      });
      return result;
    }, description);

    await browser.close();
    return { query, elementsWithId };
  } catch (error: any) {
    console.error(`Error while fetching data: ${error.message}`);
    return { error: `An error occurred: ${error.message}` };
  }
}

// Define the /fetch route
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

// Define the /fetch-description route
app.get('/fetch-description', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  const description = req.query.description as string;

  if (!query || !description) {
    return res.status(400).json({ error: 'Please provide both query and description parameters.' });
  }

  try {
    const result = await fetchDataWithDescription(query, description);
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
async function fetchOptimizedData(
  query: string,
  fields?: string[],
  summary?: boolean,
  maxResults?: number
): Promise<object> {
  const url = `https://examine.com/supplements/${query.toLowerCase()}/`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Navigate to the page
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check for 404 or missing content
    const pageTitle = await page.title();
    if (pageTitle === '404') {
      throw new Error(`No data found for the query: "${query}".`);
    }

    // Extract only the relevant sections based on `fields`
    let extractedData: { [key: string]: string } = {};
    if (fields) {
      for (const field of fields) {
        const content = await page
          .$eval(`[id*="${field}"], [class*="${field}"], [role*="${field}"]`, (element) =>
            element.textContent?.trim()
          )
          .catch(() => null);

        if (content) {
          extractedData[field] = content;
        }
      }
    } else {
      // Extract all sections if no `fields` specified
      extractedData = await page.$$eval('[id]', (elements: Element[]) => {
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
    }

    // Apply `summary` and `maxResults` options
    if (summary) {
      // Summarize content by truncating to the first 200 characters for each field
      for (const key in extractedData) {
        extractedData[key] = extractedData[key].substring(0, 200) + '...';
      }
    }

    if (maxResults) {
      const limitedData = Object.entries(extractedData)
        .slice(0, maxResults)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as { [key: string]: string });
      extractedData = limitedData;
    }

    await browser.close();

    return {
      query,
      extractedData,
    };
  } catch (error: any) {
    console.error(`Error while fetching data: ${error.message}`);
    return { error: `An error occurred: ${error.message}` };
  }
}

// Define the optimized route
app.get('/fetch-optimized', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  const fields = req.query.fields ? (req.query.fields as string).split(',') : undefined;
  const summary = req.query.summary === 'true';
  const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string, 10) : undefined;

  if (!query) {
    return res.status(400).json({ error: 'Please provide a query parameter.' });
  }

  try {
    const result = await fetchOptimizedData(query, fields, summary, maxResults);
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
