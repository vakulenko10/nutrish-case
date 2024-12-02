import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function fetchExamineData(query: string): Promise<object> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://examine.com/supplements/${query.toLowerCase()}/`;

    // Enable request interception to avoid unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Visit the page
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the Cloudflare challenge to resolve (set a suitable timeout)
    const cloudflareSelector = 'body';
    await page.waitForFunction(() => {
      const bodyText = document.body.textContent || '';
      return !bodyText.includes('Cloudflare') && bodyText.trim().length > 0;
    }, { timeout: 30000 }); // Adjust timeout as needed

    // Extract elements with IDs
    const elementsWithId = await page.$$eval('[id]', (elements) => {
      return elements.reduce((result, element) => {
        const id = element.id;
        const text = element.textContent?.trim() || 'No text content';
        if (id) result[id] = text;
        return result;
      }, {} as Record<string, string>);
    });

    await browser.close();

    return { query, elementsWithId };
  } catch (error: any) {
    return { error: `Failed to fetch data: ${error.message}` };
  }
}
