// Since there is no quantity and unit in the product, need to extract it from the name of the product.

import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";

const productsDir = "search-results";

const files = await fsPromises.readdir(productsDir);

const extractQuantityAndUnit = (
  productName: string
): { quantity: number; unit: string } => {
  // Regular expression to match a pattern of number followed by a space and a unit
  const regex = /(\d+)\s*(g|kg|oz|lb|L)/i; // Add more units as needed

  // Attempt to match the pattern within the productName string
  const matches = productName.match(regex);

  // If a match is found, return the quantity and unit
  if (matches && matches.length >= 3) {
    const quantity = parseInt(matches[1], 10); // Convert the quantity to a number
    const unit = matches[2]; // Extract the unit as is
    return { quantity, unit };
  }

  // If no match is found, return quantity as 0 and unit as none
  return { quantity: 0, unit: "none" };
};

const noItems: [{ id: number; product_name_en: string }] = [];
  

  
for (const file of files) {
  // console.log(file);
  const filePath = path.join(productsDir, file);
  // console.log(filePath);
  const data = fs.readFileSync(filePath);
  const specificProducts = JSON.parse(data.toString());
  const qtyUnit = [];
  const noQtyUnit = [];
  if (!specificProducts.items) {
    console.log(
      "no items in ",
      specificProducts.id + " - " + specificProducts.product_name_en
    );
    noItems.push({
      id: specificProducts.id,
      product_name_en: specificProducts.product_name_en,
    });
    console.log('Array: ', noItems);
    console.log('String: ', noItems.toString());
    console.log(noItems);
  } else {
    const items = specificProducts.items;
    
    items.map((item, idx) => {
      const { quantity, unit } = extractQuantityAndUnit(item.name);
      specificProducts.items[idx].quantity = quantity;
      specificProducts.items[idx].unit = unit;
      if (specificProducts.items[idx].quantity === 0) {
        // console.log(
        //   " no quantity and unit in " +
        //     specificProducts.id +
        //     " - " +
        //     specificProducts.product_name_en
        // );
        noQtyUnit.push(specificProducts.items[idx]);
      } else {
        qtyUnit.push(specificProducts.items[idx]);
      }
    });
    if(noQtyUnit.length > 0) {
      const fName = path.join("product-no-qty-unit", file);
      fs.writeFileSync(fName, JSON.stringify(noQtyUnit));
    }
    if(qtyUnit.length > 0) {
      const fileName = path.join('product-qty-unit', file);
      fs.writeFileSync(fileName, JSON.stringify(qtyUnit));
    }
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