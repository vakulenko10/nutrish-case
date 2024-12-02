"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const app = (0, express_1.default)();
const port = 5000;
// Puppeteer function to fetch and parse Examine data
async function fetchExamineData(query) {
    try {
        const browser = await puppeteer_1.default.launch({
            executablePath: process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer_1.default.executablePath(),
        });
        const page = await browser.newPage();
        const url = `https://examine.com/supplements/${query.toLowerCase()}/`;
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const pageTitle = await page.title();
        if (pageTitle === '404') {
            throw new Error(`No data found for the query: "${query}".`);
        }
        // Get the page HTML content
        const html = await page.content();
        // Ensure HTML content is available
        if (!html) {
            throw new Error("Failed to retrieve HTML content from the page.");
        }
        // Use Puppeteer to find all elements with an id attribute
        const elementsWithId = await page.$$eval('[id]', (elements) => {
            const result = {};
            elements.forEach((element) => {
                const id = element.id; // Type assertion to HTMLElement
                const textContent = element.textContent?.trim() || 'No text content available';
                if (id) {
                    result[id] = textContent;
                }
            });
            return result;
        });
        await browser.close();
        // Return the extracted data as key-value pairs
        return {
            query,
            elementsWithId
        };
    }
    catch (error) {
        return { error: `An error occurred: ${error.message}` };
    }
}
// Define the route with the correct types
app.get('/fetch', async (req, res) => {
    const query = req.query.query;
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
