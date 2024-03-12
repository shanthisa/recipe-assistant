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
import { getProductKeywords } from "./identifyProductKeywords";

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
  const portions = recipeContent.portions && (Number.isNaN(parseInt(recipeContent.portions as string))
  ? 0 : parseInt(recipeContent.portions as string));
  const cookTime = recipeContent.cookTime && (Number.isNaN(parseInt(recipeContent.cookTime as string))
  ? 0 : parseInt(recipeContent.cookTime as string));
  const prepTime = recipeContent.prepTime && (Number.isNaN(parseInt(recipeContent.prepTime as string))
  ? 0 : parseInt(recipeContent.prepTime as string)); 

  const mealRec = await db.one(
    `INSERT INTO app.meal(
    tags,
    name_en,
    method,
    portions,
    prep_time,
    cook_time,
    tips) 
    VALUES(
        $1, $2, $3, $4, $5, $6, $7
    ) RETURNING *
    `,
    [
      recipeContent.tags,
      recipeContent.nameEn,
      marked.parse(recipeContent.method),
      portions,
      prepTime,
      cookTime,
      recipeContent.tips,
    ]
  );

  for (const ingredient of recipeContent.ingredients) {
    // call that method from identifyProductKeywods to get ingredients and its keywords
    // populate the ingredients table
    console.log("ingredient: ", ingredient);
    const ing = await getProductKeywords(ingredient.nameEn);
    // I don't think this data should be an array. It should only be an object. As of now, I am taking just the first element
    // (data).map(async (ing) => {
    console.log("ingredient name in recipe: ", ing.ingredientNameInRecipe);
    console.log("ingredient name and product keyword: ", ing.ingredients);
    let firstRecId = null;
    for (let idx = 0; idx < ing.ingredients.length; idx++) {
      const finalIng = ing.ingredients[idx];
      // }
      // ing.ingredients.map(async (finalIng, idx) => {
      // if ingredient has or, there will be more than one productkeyword and ingredient name

      // If quantity is not a number (Number.isNaN(NaN) is true while NaN === NaN is false), then set the quantity to 0.
      const quantity = Number.isNaN(parseInt(ingredient.quantity as string))
        ? 0
        : parseInt(ingredient.quantity as string);
      // if ingredient.unit is undefined or set to 0 then unit is assumed as some. This is for salt and pepper.
      const unit = quantity === 0 ? "some" : ingredient.unit || "some";
      const ingRec = await db.one(
        `INSERT INTO app.ingredient(
          name,
          quantity,
          unit,
          product_keyword,
          substitute_ingredient_id,
          substitute_reason,
          meal_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
        [
          finalIng.name,
          quantity,
          unit,
          finalIng.productKeyword,
          firstRecId,
          null,
          mealRec.id,
        ]
      );
      if (ing.ingredients.length > 1 && idx === 0) {
        firstRecId = ingRec.id;
      }
    }
    // )
    // )
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

const recipePath = "recipes-json-test";
const importedPath = "recipes-imp";
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
