// Since there is no quantity and unit in the product, need to extract it from the name of the product.

import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";

const productsDir = "product-results";

const files = (await fsPromises.readdir(productsDir)).filter(f => path.extname(f) === ".json");

const extractQuantityAndUnit = (
  productName: string
): { quantity: number; unit: string } => {
  // Regular expression to match a pattern of number followed by a space and a unit
  
  const regex = /([\d\.\,]+)\s*(mg|g|kg|oz|lb|L|ml|each)/i; // Add more units as needed

  // Attempt to match the pattern within the productName string
  const matches = productName.match(regex);

  // If a match is found, return the quantity and unit
  if (matches && matches.length >= 3) {
    const quantity = parseFloat(matches[1]); // Convert the quantity to a number
    const unit = matches[2]; // Extract the unit as is
    return { quantity, unit };
  }

  // If no match is found, return quantity as 0 and unit as none
  return { quantity: 0, unit: "none" };
};

const noItems: [{ keyword: string }] = [];
  
for (const file of files) {
  // console.log(file);
  const filePath = path.join(productsDir, file);
  // console.log(filePath);
  const data = fs.readFileSync(filePath);
  console.log(filePath);
  const specificProducts = JSON.parse(data.toString());
  const qtyUnit = [];
  const noQtyUnit = [];
  if (!specificProducts.items) {
    console.log(
      "no items in ",
      specificProducts.id + " - " + specificProducts.product_name_en
    );
    noItems.push({
      keyword: specificProducts.keyword
    });
    console.log('Array: ', noItems);
    console.log('String: ', noItems.toString());
    console.log(noItems);
  } else {
    const items = specificProducts.items;
    
    //get all product items if they have the quantity 
    // get the first product item if none of the items have a quantity
    let qtyCount = 0;
    items.map((item, idx) => {
      item.product_keyword = specificProducts.keyword;
      const { quantity, unit } = extractQuantityAndUnit(item.name);
      item.quantity = quantity;
      item.unit = unit;
      if (item.quantity !== 0) {
        qtyUnit.push(item);
        qtyCount++;
      } else {
        noQtyUnit.push(item);
      }
      const prodFileName = path.join('product-list', file);
      fs.writeFileSync(prodFileName, JSON.stringify(item, null, 2));
    });
    
    // if(noQtyUnit.length > 0) {
    //   const fName = path.join("product-no-qty-unit", file);
    //   fs.writeFileSync(fName, JSON.stringify(noQtyUnit, null, 2));
    // }
    // if(qtyUnit.length > 0) {
    //   const fileName = path.join('product-qty-unit', file);
    //   fs.writeFileSync(fileName, JSON.stringify(qtyUnit, null, 2));
    // }
  }
  // no items in  Balsamic Vinegar
  // no items in  Freshly Grated Ginger
  // no items in  Apple
  // console.log(specificProducts.items[0].id);
  // console.log(specificProducts.items[0].name);
  // console.log(specificProducts.id);
  // console.log(specificProducts.product_name_en);
  // const product = extractQuantityAndUnit(specificProducts.items[0].name);

  // console.log('quantity: ', product?.quantity);
  // console.log('unit: ', product?.unit);
}
fs.writeFileSync("products-no-items.json", JSON.stringify(noItems));