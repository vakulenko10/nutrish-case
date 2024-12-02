"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.examineTool = void 0;
exports.fetchExamineData = fetchExamineData;
const puppeteer_1 = __importDefault(require("puppeteer"));
// Function to fetch Examine.com data
function fetchExamineData(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.launch({ headless: true });
            const page = yield browser.newPage();
            const url = `https://examine.com/supplements/${query.toLowerCase()}/`;
            yield page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                }
                else {
                    req.continue();
                }
            });
            yield page.goto(url, { waitUntil: 'domcontentloaded' });
            const pageTitle = yield page.title();
            if (pageTitle === '404') {
                throw new Error(`No data found for the query: "${query}".`);
            }
            const elementsWithId = yield page.$$eval('[id]', (elements) => {
                return elements.reduce((result, element) => {
                    var _a;
                    const id = element.id;
                    const text = ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'No text content';
                    if (id)
                        result[id] = text;
                    return result;
                }, {});
            });
            yield browser.close();
            return { query, elementsWithId };
        }
        catch (error) {
            return { error: `Failed to fetch data: ${error.message}` };
        }
    });
}
// Registering the tool for Vercel AI SDK
exports.examineTool = {
    name: "fetchExamineData",
    description: "Fetch nutritional supplement information from Examine.com.",
    inputs: [{ name: "query", type: "string", description: "The supplement to search for" }],
    outputs: [{ name: "elementsWithId", type: "object", description: "Key-value pairs of elements found on the page" }],
    execute: (_a) => __awaiter(void 0, [_a], void 0, function* ({ query }) {
        if (!query)
            throw new Error("Query parameter is required.");
        return yield fetchExamineData(query);
    }),
};
