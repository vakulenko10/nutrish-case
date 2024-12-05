import chromium from '@sparticuz/chromium'; // Import Chromium configuration for headless browser
import puppeteer, { Browser } from 'puppeteer-core'; // Import Puppeteer for web scraping

// Declare a global variable to hold the browser instance
let browser: Browser | null = null;

/**
 * Function to get or initialize the Puppeteer browser instance.
 * This function ensures that only one instance of the browser is created and reused.
 *
 * @returns {Promise<Browser>} - The Puppeteer Browser instance.
 */
export async function getBrowser(): Promise<Browser> {
  // Check if a browser instance already exists
  if (!browser) {
    try {
      // If no browser instance exists, launch a new one
      browser = await puppeteer.launch({
        args: chromium.args, // Browser launch arguments optimized for headless Chromium
        defaultViewport: chromium.defaultViewport, // Set the default viewport (width/height) for pages
        executablePath: await chromium.executablePath(), // Get the path to the Chromium executable
        headless: chromium.headless, // Launch the browser in headless mode (no GUI)
      });
    } catch (error: any) {
      // Log an error if the browser fails to launch
      console.error('Error while launching the browser:', error.message);

      // Optionally rethrow the error or handle it as needed
      throw new Error('Failed to launch the browser');
    }
  }else{
    console.log('clearing inside the else block')
    try {
      const pages = await browser.pages();
      await Promise.all(pages.map((page) => page.close())).then(()=>console.log('successfully closed'));
      console.log('Pages closed.');
  } catch (pageError) {
      console.error('Error while closing pages:', pageError);
  } 
  }

  // Return the browser instance
  return browser;
}
