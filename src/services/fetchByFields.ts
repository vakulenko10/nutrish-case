import { getBrowser } from '../config/puppeteerConfig';
export async function fetchOptimizedData(
    query: string,
    fields?: string[],
    summary?: boolean,
    maxResults?: number
  ): Promise<object> {
    const url = `https://examine.com/supplements/${query.toLowerCase()}/`;
  
    let browser = null;
    try {
        const browser = await getBrowser();
        const page = await browser.newPage();
  
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.setViewport({ width: 800, height: 600 });
      await page.setCacheEnabled(true); // Enable caching
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType(); 
        const url = request.url();

        const blockedDomains = ['google-analytics.com', 'facebook.com', 'doubleclick.net', 'ads'];

        if (
          ['image', 'stylesheet', 'font', 'media', 'script'].includes(resourceType) ||
          blockedDomains.some((domain) => url.includes(domain))
        ){
          request.abort();
        } else {
          request.continue();
        }
      });
  
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
      const pageTitle = await page.title();
      if (pageTitle === '404') {
        throw new Error(`No data found for the query: "${query}".`);
      }
  
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
  
      if (summary) {
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
  
      return {
        query,
        extractedData,
      };
    } catch (error: any) {
      console.error(`Error while fetching data: ${error.message}`);
      return { error: `An error occurred: ${error.message}` };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }