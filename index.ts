/**
 * Import openai
 * Read content from prompt.txt
 * Read current recipe from stdin
 * make openai call
 * print json output to console
 */

import OpenAI from "openai";
import fs from "fs";

const prompt = fs.readFileSync("prompt.txt");

// const recipe = fs.readFileSync(0);
const recipes = fs.readdirSync("recipes");
console.log("recipes: ", recipes);

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

for (let recipePath of recipes) {
  const recipe = fs.readFileSync('recipes/' + recipePath);
  const jsonContent = await recipeToJSON(recipe);
  if (jsonContent) { 
    fs.writeFileSync('recipes/'+recipePath+'.json', jsonContent);
  } else {
    console.error('Error occured in ', recipePath);
  }
}
