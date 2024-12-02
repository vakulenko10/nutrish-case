import puppeteer from 'puppeteer';

async function fetchExamineDataWithPuppeteer(query: string): Promise<object> {
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

    const description = await page.$eval(
      '.overview',
      (el) => el.textContent?.trim() || 'No description available.'
    );

    const benefits = await page.$$eval('.benefits-list li', (elements) =>
      elements.map((el) => el.textContent?.trim() || '')
    );

    await browser.close();

    return {
      query,
      description,
      benefits: benefits.length > 0 ? benefits : ['No benefits listed.'],
    };
  } catch (error: any) {
    return { error: `An error occurred: ${error.message}` };
  }
}

// Example usage
(async () => {
  const query = process.argv[2] || 'creatine';
  const result = await fetchExamineDataWithPuppeteer(query);
  console.log(JSON.stringify(result, null, 2));
})();
