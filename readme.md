# Recipe Assistant

## Open AI to generate recipes as JSON
There were 114 recipes in docx format which required to be imported to the database for the client. There were 413 products (unique / distinct) used as ingredients in these recipes. This required data entry in the meals, products and measure table. Since manual entries would require lot of time and prone to errors, I was thinking for

Used open AI api to parse meal planner recipes

Added a new file to connect to the database of meal planner and insert the recipe content
    from a json to the database.
    Used pg-promise to connect to the database
    Used marked to convert the existing markdown to a html so that it can be saved into the database as html.

Convert docx files to txt files from the recipes-docx to recipes-txt

 Added a functionality to convert all docx files in recipe-docx folder to txt format and generate all txt in the recipes-
txt folder  to json files in recipes-json folder and move all the finished txt files to recipes-extracted

Used fsPromises to read all files in the folder and path to join path and file name.
    Connected to the database and inserted records to product based on ingredients of each meal making sure only unique valu
es are entered
    Inserted records to measure table based on the product and meal inserted.

extracted product name and id from database using copy of psql and stored it in a csv
    construct search URL for Walmart with the extracted product name parsing the csv.
    used scraperapi to scrape these constructed search URL and generated JSON files adding the product name and id.


 Used RegEx to find the quantity and unit from the name of the product since there was no quantity and unit in the scraped jsons and updated the json files and wrote it to a folder product-qty-unit.
    If there is no quantity mentioned in the item name, then assigned quantity as zero and unit as some, and updated the json files and wrote it to a folder product-no-qty-unit.
    If there are no items in the product json, then that is listed under product-no-items.json

Modified the quantity to include decimals so that values such as 0.18 doesn't get rounded to 18. Included RegEx to have decimal and used parseFloat
    Filtered the files to only include JSON
    Changed the condition to get all product items only if they have the quantity. If no quantity then got the first item and added product-no-qty-unit folder so that they can be manually corrected.

    Ingredient:
    Name -> Butter or oil
    meal_id

    Measure:
    ingredient_id
    product_id, qty, unit
    Butter, 10 g
    oil, 15 ml

    Generic_Product: 
    id
    name: Butter 

    Product:
    product_id
    UPC
    price
    qty 
    unit
    image url
    name: unsalted butter

Ingredient: 
meal_id
Name = Freshly cut ginger
meal = stir veg fry
qty = 1
unit = ea
subsitute_ingredient_id: 
substitute_reason: array - eg. "vegan", "gluten free", "healthy", "low sodium", "vegetarian"
product_keyword='ginger'

Products:
id: 1, name: 'Atlantic ginger'
id: 2, name: 'Walmart ginger'
product_keyword='ginger'
tags: array - - eg. "vegan", "gluten free", "healthy", "low sodium", "vegetarian"

// Get the ingredients from the recipe
// Identify the product keyword from the ingredient
// If there is a single word, then directly use it as the product keyword for the product search
// If there are multiple options with 'or' or commas, then construct the substitute
// Butter, margerine or oil
// 1: Butter, substitute_ingredient_id: null, meal_id: 1
// 4: Butter, substitute_ingredient_id: null, meal_id: 2 
// 2: Ghee, substitute_ingredient_id: 1, meal_id: 1
// 3: Oil, substitute_ingredient_id: 1, meal_id: 1
// Identify the unique product_keywords and then search for the scraperapi
// Store the product_keyword with the products.
// Use a general inverted index (GIN index) for searching product based on the keyword associated with the ingredent.


convert-txt -> parse-txt-to-json -> import meal
                                 -> import ingredients from recipe-name.json
                                    -> check and split ingredient name for substitutes 'Eg: Freshly cut parsley or cilantro' output: json file
                                    -> import each ingredient 'Freshly cut parsley', 'Freshly cut cilantro'
                                    -> identify the product keyword from each ingredient 
                                    -> distinct all product keywords -> search for product keyword with scraper api
                                                                       -> Identify all the items based on upc
                                                                       -> extract unit and quantity with title
                                                                       -> upsert to product table and associate the product keyword
