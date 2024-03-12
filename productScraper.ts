import pgPromise from "pg-promise";
import fspromise from "fs/promises";
import fs from "fs";

const pgpMain = pgPromise();
const db = pgpMain(process.env.DB_URL!);


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
  
  const failedProducts: [string] = [];

  // extract distinct of product keywords from ingredients table.
  // this can be used for scraper api searches.
  const distinctKeywords = await db.any(`
    SELECT DISTINCT product_keyword FROM app.ingredient order by product_keyword
  `);
  
 const productKeywords = distinctKeywords.map((r) => r.product_keyword);
  for (const product of productKeywords) {
    try {
      const searchResults = await runSearch(product);
      searchResults.keyword = product;
      let fileName = `${product}`;
      // write search result to file
      await fspromise.writeFile(
        `./product-results/${fileName}.json`,
        JSON.stringify(searchResults, null, 2)
      );
    } catch (e) {
      console.error("Error parsing JSON", e);
      failedProducts.push(product);
    }
  }
  
  fs.writeFileSync('failed-products.json', JSON.stringify(failedProducts));