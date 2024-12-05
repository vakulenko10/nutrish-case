import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getBrowser } from '../config/puppeteerConfig';
function sanitizeFields(fields?: string | string[]): string[] {
  if (!fields) return [];
  
  // Convert string to array if necessary
  const fieldsArray = Array.isArray(fields) ? fields : fields.split(',');

  // Sanitize each field
  return Array.from(
      new Set(
          fieldsArray.map(field =>
              field
                  .trim() // Remove unnecessary spaces
                  .toLowerCase() // Convert to lowercase for consistency
                  .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
          )
      )
  ).filter(Boolean); // Remove empty strings
}
// Function to fetch data from Examine.com with suggestions if no direct match is found
export async function fetchDataWithSuggestions(
  query: string, // The name of the supplement to search for (e.g., "vitamin-c"). It should match or be similar to supplement names listed on Examine.com.
  fields?: string[], // An optional array of keywords or fields (e.g., "benefits", "dosage") to extract specific sections of information from the page.
  summary?: boolean, // A boolean flag indicating whether the returned data should be truncated to shorter snippets for concise output. Default is `false`.
  maxResults?: number // An optional parameter to limit the number of results returned in the response (e.g., "5" to return the top 5 matches).
): Promise<object> {

  // Log entry into the function
  console.log('Entering the fetchDataWithSuggestions function');

  // Validate and sanitize the query (e.g., convert spaces to hyphens for valid URLs)
  const sanitizedQuery = query.trim().toLowerCase().replace(/\s+/g, '-');
  const sanitizedFields = sanitizeFields(fields);
        console.log(`Sanitized fields: ${sanitizedFields.join(', ')}`);
  // URLs for the supplement page and the search page
  const url = `https://examine.com/supplements/${sanitizedQuery}/`;
  const searchUrl = `https://examine.com/search/?q=${encodeURIComponent(sanitizedQuery)}`;

  let browser = null;
  try {
    // Get a Puppeteer browser instance
    // const browser = await getBrowser();
    const browser = await puppeteer.launch({
      args: chromium.args, // Browser launch arguments optimized for headless Chromium
      defaultViewport: chromium.defaultViewport, // Set the default viewport (width/height) for pages
      executablePath: await chromium.executablePath(), // Get the path to the Chromium executable
      headless: chromium.headless, // Launch the browser in headless mode (no GUI)
    });
    const page = await browser.newPage();

    // Set a custom user agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    await page.setViewport({ width: 800, height: 600 });
    await page.setCacheEnabled(true);

    // Intercept requests to block unnecessary resources (e.g., ads, analytics)
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();

      const blockedDomains = ['google-analytics.com', 'facebook.com', 'doubleclick.net', 'ads'];
      if (
        ['image', 'stylesheet', 'font', 'media', 'script'].includes(resourceType) ||
        blockedDomains.some((domain) => url.includes(domain))
      ) {
        request.abort(); // Block unnecessary requests
      } else {
        request.continue();
      }
    });

    // Navigate to the supplement page
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check if the page is valid (404 indicates no data for the query)
    const pageTitle = await page.title();
    if (pageTitle === '404') {
      throw new Error(`No data found for the query: "${sanitizedQuery}".`);
    }

    // Data structure to store extracted data
    const extractedData: { [key: string]: string[] } = {};

    // Search terms to look for in the page content
    const searchTerms = sanitizedFields && sanitizedFields.length > 0 ? [...sanitizedFields, query] : [query];

    // Loop through each search term and extract relevant data
    for (const term of searchTerms) {
      console.log(`Searching for term: ${term}`);

      const matchingContent = await page
        .evaluate((term) => {
          const bodyText = document.body.innerText.toLowerCase();
          const matches: string[] = [];

          // Use regex to find text around the search term
          const regex = new RegExp(`.{0,200}${term.toLowerCase()}.{0,200}`, 'gi');
          const foundMatches = bodyText.match(regex);

          if (foundMatches) {
            foundMatches.forEach((match) => matches.push(match.trim()));
          }

          // Check for IDs containing the search term
          document.querySelectorAll('[id]').forEach((element) => {
            const id = element.id.toLowerCase();
            if (id.includes(term.toLowerCase())) {
              const textContent = element.textContent?.trim();
              if (textContent) matches.push(textContent);
            }
          });

          return matches;
        }, term)
        .catch(() => []);

      if (matchingContent.length > 0) {
        if (!extractedData[term]) extractedData[term] = [];
        const uniqueItems = new Set([...extractedData[term], ...matchingContent]);
        extractedData[term] = Array.from(uniqueItems); // Ensure no duplicates
      } else {
        extractedData[term] = ['No matches found'];
      }
    }

    // Optional: Summarize the data if the summary flag is true
    if (summary) {
      for (const key in extractedData) {
        extractedData[key] = extractedData[key].map((item) => item.substring(0, 200) + '...');
      }
    }

    // Limit the results if maxResults is specified
    if (maxResults) {
      Object.keys(extractedData).forEach((key) => {
        extractedData[key] = extractedData[key].slice(0, maxResults);
      });
    }

    // Check if any relevant data was found
    const hasRelevantData = Object.values(extractedData).some(
      (items) => items.length > 0 && items[0] !== 'No matches found'
    );

    // If no relevant data, search for suggestions
    if (!hasRelevantData) {
      console.log('No relevant data found on the supplement page. Searching for suggestions...');
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const suggestions = await page
        .evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href^="/supplements/"]'));
          return links.map((link) => ({
            title: link.textContent?.trim(),
            url: (link as HTMLAnchorElement).href,
          }));
        })
        .catch(() => []);

      // Return suggestions if no direct data is found
      return {
        query: sanitizedQuery.replace(/-/g, ' '), // Convert query back to human-readable format
        error: `No direct data found for the query: "${sanitizedQuery.replace(/-/g, ' ')}".`,
        suggestions: suggestions.slice(0, maxResults || 5),
      };
    }
    const pages = await (browser as Browser).pages();
    console.log("pages",JSON.stringify(pages))
    console.log("type of pages:",typeof(pages))
    // Return extracted data if relevant data was found
    return {
      query: sanitizedQuery.replace(/-/g, ' '), // Convert query back to human-readable format
      extractedData,
    };
  } catch (error: any) {
    console.error(`Error while fetching data: ${error.message}`);
    return { error: `An error occurred: ${error.message}` };
  } finally {
    if (browser) {
      console.log('Attempting to close the browser...');
      try {
        await (browser as Browser).close();
        console.log('Browser closed successfully.');
      } catch (error) {
        console.error('Error while closing the browser:', error);
      }
    } else {
      console.log('Browser was not initialized or already closed.');
    }
  }
}
