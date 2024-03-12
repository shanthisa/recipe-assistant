/**
 * Import openai
 * Read content from prompt.txt
 * Read current recipe from stdin
 * make openai call
 * print json output to console
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

const prompt = fs.readFileSync("prompt.txt");

const recipeToJSON = async (recipe) => {
  const openai = new OpenAI();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: prompt.toString() },
      { role: "user", content: recipe.toString() },
    ],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });

  if (completion.choices[0].finish_reason == "stop") {
    return completion.choices[0].message.content;
  } else {
    console.log("error: ", completion);
    return null;
  }
};

const recipesTxtDir = "recipes-txt";
const recipesJSONDir = "recipes-json";

const recipes = fs.readdirSync(recipesTxtDir);

for (let recipeTxtPath of recipes) {
  const recipeTextPath = path.join(recipesTxtDir, recipeTxtPath);
  const recipe = fs.readFileSync(recipeTextPath);
  const jsonContent = await recipeToJSON(recipe);
  if (jsonContent) { 
    const jsonRecipe = path.join(recipesJSONDir, path.basename(recipeTxtPath, ".txt") + '.json');
    fs.writeFileSync(jsonRecipe, jsonContent);
    const newPath = path.join('recipes-extracted', recipeTxtPath);
    fs.renameSync(recipeTextPath, newPath);
  } else {
    console.error('Error occured in ', recipeTxtPath);
  }

}
