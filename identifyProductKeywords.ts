import OpenAI from "openai";
import fs from 'fs';

// const openai = new OpenAI({baseURL: "http://127.0.0.1:11434/v1"});
const openai = new OpenAI();

const prompt = `
Given a ingredient name of a recipe as it exists in a recipe document, I want you to split the input into different ingredient names as the output. 

Examples:

input  -  "Green or yellow beans"  
output - {"ingredientNameInRecipe": "Green or Yellow Beans", "ingredientNames": ["Green beans", "yellow beans"]}

input -  "Chicken or Vegetable broth"
output - {"ingredientNameInRecipe": "Chicken or Vegetable broth", "ingredientNames": ["Vegetable Broth", "Chicken Broth"]}

Only respond in valid JSON as above.
`

const concisePrompt = `
Given a descriptive product, I want a product that can be bought in the grocery store.
input - "Freshly squeezed orange juice"
output - {"ingredientName": "Freshly squeezed orange juice", "productKeyword": "orange"}

input - "Freshly chopped parsley"
output - {"ingredientName": "Freshly chopped garlic", "productKeyword": "parsley"}

Only respond in valid JSON as above.
`
// ingredientsofRecipes = [{"ingredientNameRecipe": "", "ingredients": [{"name": "", "productKeyword": ""}]}]
// product = [{keyword: "results[idx1].ingredients[idx2].productKeyword", items: []}]

export const splitIngredientNames = async (ingredient) => {
    const response = await  openai.chat.completions.create({
        messages: [
            { role: "system", content: prompt.toString() },
            { role: "user", content: ingredient.toString() },
        ],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
    })
    const data = JSON.parse(response.choices[0].message.content!);
    return data
}

//getting json files
// from the json list identify the ones which has or and which does not. 
// Split the ones with or and add it to the list which does not have or.
// Pass the consolidated list to the concisePrompt.

const getProductKeyword = async(ingredientName) : Promise<{ingredientName: string, productKeyword: string}> => {
    const response = await openai.chat.completions.create({
        messages: [
            { role: "system", content: concisePrompt.toString() },
            { role: "user", content: ingredientName.toString() },
        ],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object"},
    })
    const data = JSON.parse(response.choices[0].message.content!);
    return data
}

type IngredientType = {name: string, productKeyword: string}

type IngredientsOfRecipesType = {
    ingredientNameInRecipe: string, 
    ingredients: IngredientType[]
}

// let ingredientsOfRecipes : IngredientsOfRecipesType[] = [];
const fileNames = fs.readdirSync('search-results').filter((file) => file.endsWith('.json'));

// for (let file of fileNames) {
export const getProductKeywords = async (ingredientNameInRecipe): Promise<IngredientsOfRecipesType> => {

    // const ingredientNameInRecipe = ingredientFile.split(' - ')[1].replace('.json', '');
    // extract this method to take in the ingredient name recipe and output the following
    // {"ingredientNameInRecipe": "", "ingredients": [{"name": "", "productKeyword": ""}]}
    // this needs to be exported from this module.
    let ingredientNames = [ingredientNameInRecipe];
    if (ingredientNameInRecipe.includes(' or ')) {
        const splitIngredients = await splitIngredientNames(ingredientNameInRecipe);
        ingredientNames = splitIngredients.ingredientNames;
    }
    let ingredients = await Promise.all(ingredientNames.map(async (ingredientName) => {
        const result = await getProductKeyword(ingredientName);
        return {name: ingredientName, productKeyword: result.productKeyword}
    }))
    return {ingredientNameInRecipe, ingredients};
    // return ingredientsOfRecipes;
// ingredientsofRecipes = [{"ingredientNameInRecipe": "", "ingredients": [{"name": "", "productKeyword": ""}]}]
}




