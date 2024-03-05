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
import {marked} from "marked";

type IngredientType = {
    nameEn: string,
    quantity: number,
    unit: string
}

type RecipeContentType = {
    tags: string[], //tags
  nameEn: string, //name_en
  method: string, //method
  portions?: number, //serves
  prepTime?: number, // not existing
  cookTime?: number, //cooking_duration
  tips?: string, //tips
  ingredients: IngredientType[],
}
// code, categories, descriptionEn, nameFr, descriptionFr, photo_url, video_url
// total_cost, serving_cost, tips, servings_size, servings_size_unit, nutrition_rating

const pgpMain = pgp();
const db = pgpMain(process.env.DB_URL!);
const fileName = "recipes" + "/" + "MMS 8 Honey Roasted Root Vegetables.txt.json";
const data = fs.readFileSync(fileName);
const recipeContent: RecipeContentType = JSON.parse(data.toString());

const rec = await db.one(`INSERT INTO app.meal(
    tags,
    name_en,
    method,
    serves,
    cooking_duration,
    tips) 
    VALUES(
        $1, $2, $3, $4, $5, $6
    ) RETURNING *
    `, [recipeContent.tags,
        recipeContent.nameEn,
        marked.parse(recipeContent.method),
        recipeContent.portions,
        recipeContent.cookTime,
        recipeContent.tips
    ]);


console.log(rec);

// try {
//     const meals = await db.any('SELECT * FROM app.meal');
//     console.log(meals);
// }
// catch(e) {
//     console.error(e);
// }

