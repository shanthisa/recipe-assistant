// Copied all the products from the products table with psql
// postgres=# \copy (select id, name_en from app.product) to 'product.csv' with csv header;
/**
 * extracted product name and id from database using copy of psql and stored it in a csv
*  construct search URL for Walmart with the extracted product name parsing the csv.
*  used scraperapi to scrape these constructed search URL and generated JSON files adding the product name and id.
 */

import fspromise from "fs/promises";
import fs from "fs";
import csvParser from "csv-parser";


type CSVType = { id: number; name_en: string };

const parseCSV = (): Promise<[CSVType]> => {
  let results: [CSVType] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("product.csv")
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
};

let csvResults = await parseCSV();

const constructSearchURL = (product) => {
  const productQuery = product.split(" ").join("+");
  return `https://www.walmart.ca/en/search?q=${productQuery}`;
};

const runSearch = async (product) => {
  const searchURL = constructSearchURL(product);
  console.log("searchURL", searchURL);
  const apiKey = "648ad4215481277b72eaeedbe85304a2";
  const url = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(searchURL)}&autoparse=true`;
  let res = await fetch(url);
  let contentText = await res.text();

  const content = JSON.parse(contentText);
  return content;
};

const failedProducts: [CSVType] = [];
// extract distinct of product keywords from ingredients table.
// this can be used for scraper api searches.
const productKeywords = await db.any(`
  SELECT DISTINCT product_keyword FROM app.ingredient
`);

// for (const product of csvResults) {
for (const product of productKeywords)
  try {
    if (product.name_en.includes(' or ')) {
      const firstProduct = product.name_en.split(' or ')[0];
      const secondProduct = product.name_en.split(' or ')[1];
      console.log('product: ', product);
      console.log('firstProduct: ', firstProduct);
      console.log('secondProduct: ', secondProduct);
    }
    // const searchResults = await runSearch(product.name_en);
    // searchResults.id = product.id;
    // searchResults.product_name_en = product.name_en;
    // let fileName = `${product.id} - ${product.name_en}`;
    // // write search result to file
    // await fspromise.writeFile(
    //   `./search-results/${fileName}.json`,
    //   JSON.stringify(searchResults, null, 2)
    // );
  } catch (e) {
    console.error("Error parsing JSON", e);
    failedProducts.push(product);
  }
}

fs.writeFileSync('failed-products.json', JSON.stringify(failedProducts));
