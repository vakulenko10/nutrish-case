import chromium from '@sparticuz/chromium';
import puppeteer, { Browser } from 'puppeteer-core';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    try {
      // Attempt to launch the browser
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } catch (error: any) {
      console.error('Error while launching the browser:', error.message);
      // You can throw the error again or return a fallback
      throw new Error('Failed to launch the browser');
    }
  }

  return browser;
}
