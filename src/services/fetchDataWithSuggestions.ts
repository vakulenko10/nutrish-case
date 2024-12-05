import { getBrowser } from '../config/puppeteerConfig';

export async function fetchDataWithSuggestions(
  query: string,
  fields?: string[],
  summary?: boolean,
  maxResults?: number
): Promise<object> {
  const url = `https://examine.com/supplements/${query.toLowerCase()}/`;
  const searchUrl = `https://examine.com/search/?q=${encodeURIComponent(query)}`;

  let browser = null;
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    await page.setViewport({ width: 800, height: 600 });
    await page.setCacheEnabled(true);
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();

      const blockedDomains = ['google-analytics.com', 'facebook.com', 'doubleclick.net', 'ads'];

      if (
        ['image', 'stylesheet', 'font', 'media', 'script'].includes(resourceType) ||
        blockedDomains.some((domain) => url.includes(domain))
      ) {
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

    const extractedData: { [key: string]: string[] } = {};
    const searchTerms = fields && fields.length > 0 ? [...fields, query] : [query];

    for (const term of searchTerms) {
      console.log(`Searching for term: ${term}`);

      const matchingContent = await page
        .evaluate((term) => {
          const bodyText = document.body.innerText.toLowerCase();
          const matches: string[] = [];

          // Find matching text in the body content
          const regex = new RegExp(`.{0,200}${term.toLowerCase()}.{0,200}`, 'gi');
          const foundMatches = bodyText.match(regex);

          if (foundMatches) {
            foundMatches.forEach((match) => matches.push(match.trim()));
          }

          // Check elements with matching IDs
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
        extractedData[term] = Array.from(uniqueItems);
      } else {
        extractedData[term] = ['No matches found'];
      }
    }

    // Optional: Summarize the data
    if (summary) {
      for (const key in extractedData) {
        extractedData[key] = extractedData[key].map((item) => item.substring(0, 200) + '...');
      }
    }

    // Limit results if maxResults is specified
    if (maxResults) {
      Object.keys(extractedData).forEach((key) => {
        extractedData[key] = extractedData[key].slice(0, maxResults);
      });
    }

    // If no data is found, search for suggestions
    const hasRelevantData = Object.values(extractedData).some(
      (items) => items.length > 0 && items[0] !== 'No matches found'
    );

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

      return {
        query,
        error: `No direct data found for the query: "${query}".`,
        suggestions: suggestions.slice(0, maxResults || 5),
      };
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
