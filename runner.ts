import { fetchExamineData } from './aiSDKTool';

(async () => {
  const query = "creatine"; // Replace with any supplement you want to test
  console.log(`Fetching data for: ${query}...`);

  try {
    const data = await fetchExamineData(query);
    console.log(JSON.stringify(data, null, 2)); // Pretty-print the result
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
})();