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
Object.defineProperty(exports, "__esModule", { value: true });
const aiSDKTool_1 = require("./aiSDKTool");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const query = "creatine"; // Replace with any supplement you want to test
    console.log(`Fetching data for: ${query}...`);
    try {
        const data = yield (0, aiSDKTool_1.fetchExamineData)(query);
        console.log(JSON.stringify(data, null, 2)); // Pretty-print the result
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
    }
}))();
