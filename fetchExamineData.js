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
const puppeteer_1 = __importDefault(require("puppeteer"));
function fetchExamineDataWithPuppeteer(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.launch();
            const page = yield browser.newPage();
            const url = `https://examine.com/supplements/${query.toLowerCase()}/`;
            yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            yield page.goto(url, { waitUntil: 'domcontentloaded' });
            const pageTitle = yield page.title();
            if (pageTitle === '404') {
                throw new Error(`No data found for the query: "${query}".`);
            }
            const description = yield page.$eval('.overview', (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'No description available.'; });
            const benefits = yield page.$$eval('.benefits-list li', (elements) => elements.map((el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; }));
            yield browser.close();
            return {
                query,
                description,
                benefits: benefits.length > 0 ? benefits : ['No benefits listed.'],
            };
        }
        catch (error) {
            return { error: `An error occurred: ${error.message}` };
        }
    });
}
// Example usage
(() => __awaiter(void 0, void 0, void 0, function* () {
    const query = process.argv[2] || 'creatine';
    const result = yield fetchExamineDataWithPuppeteer(query);
    console.log(JSON.stringify(result, null, 2));
}))();
