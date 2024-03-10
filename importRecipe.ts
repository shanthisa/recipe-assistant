/**
 * import recipe to meal
 * import ingredients
 * add name into products and include only unique (if not exists)
 * add quantity to measure
 */

// connect to the db
// load and parse the json file
// insert into meal
// insert ingredient into product if not exists
// insert ingredients to measure connecting product and meal

import pgp from "pg-promise";
import fs from "fs";
import fsPromises from "fs/promises";
import { marked } from "marked";

// path is required for joining paths across Linux, Windows identifying which / to put
import path from "path";

type IngredientType = {
  nameEn: string;
  quantity: number | string | undefined;
  unit: string | undefined;
};

type RecipeContentType = {
  tags: string[]; //tags
  nameEn: string; //name_en
  method: string; //method
  portions?: number; //serves
  prepTime?: number; // not existing
  cookTime?: number; //cooking_duration
  tips?: string; //tips
  ingredients: IngredientType[];
};
// code, categories, descriptionEn, nameFr, descriptionFr, photo_url, video_url
// total_cost, serving_cost, tips, servings_size, servings_size_unit, nutrition_rating

const pgpMain = pgp();
const db = pgpMain(process.env.DB_URL!);

const importRecipe = async (fileName) => {
  console.log("Starting import of ", fileName);
  const data = fs.readFileSync(fileName);
  const recipeContent: RecipeContentType = JSON.parse(data.toString());
  const rec = await db.one(
    `INSERT INTO app.meal(
    tags,
    name_en,
    method,
    serves,
    cooking_duration,
    tips) 
    VALUES(
        $1, $2, $3, $4, $5, $6
    ) RETURNING *
    `,
    [
      recipeContent.tags,
      recipeContent.nameEn,
      marked.parse(recipeContent.method),
      recipeContent.portions,
      recipeContent.cookTime,
      recipeContent.tips,
    ]
  );

for (const ingredient of recipeContent.ingredients) {
  
}
//   // for (const ingredient of recipeContent.ingredients) {
//   //   let prodRec = await db.any("SELECT * FROM app.product where name_en=$1", [
//   //     ingredient.nameEn,
//   //   ]);
//   //   let measureRec;
//   //   let measureProd = prodRec[0];
//   //   if (prodRec.length === 0) {
//   //     let prodRecord = await db.one(
//   //       `INSERT INTO app.product(
//   //           name_en,
//   //           code,
//   //           price,
//   //           quantity,
//   //           unit
//   //       ) VALUES(
//   //           $1, $2, $3, $4, $5
//   //       ) RETURNING *`,
//   //       [ingredient.nameEn, "", 0, 0, ""]
//   //     );
//   //     measureProd = prodRecord;
//   //   }

//     // If quantity is not a number (Number.isNaN(NaN) is true while NaN === NaN is false), then set the quantity to 0.
//     const quantity = Number.isNaN(parseInt(ingredient.quantity as string)) ? 0 : parseInt(ingredient.quantity as string);
//     // if ingredient.unit is undefined or set to 0 then unit is assumed as some. This is for salt and pepper.
//     const unit = quantity === 0 ? 'some' : (ingredient.unit || "some");
//     measureRec = await db.one(
//       `INSERT into app.measure(
//             product_id, 
//             meal_id, 
//             quantity,
//             unit
//             )
//             VALUES(
//                 $1, $2, $3, $4
//             ) RETURNING *`,
//       [measureProd.id, rec.id, quantity, unit]
//     );
//     console.log("Ingredient:", measureProd.name_en);
//     console.log("quantity: ", measureRec.quantity);
//   }
};

const recipePath = "recipes-json";
const importedPath = "recipes-imported";
let jsonFiles: string[] = [];
const files = await fsPromises.readdir(recipePath);
jsonFiles = files.filter(
  (fName) => path.extname(fName).toLowerCase() === ".json"
);
console.log("jsonFiles: ", jsonFiles);

for (const jsonFile of jsonFiles) {
  await importRecipe(path.join(recipePath, jsonFile));
  fs.renameSync(
    path.join(recipePath, jsonFile),
    path.join(importedPath, jsonFile)
  );
  console.log("imported: ", jsonFile);
}