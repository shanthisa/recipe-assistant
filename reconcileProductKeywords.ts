import fs from "fs";
import lodash from "lodash";

const prodKeywords = fs.readFileSync('distinct_prod_key.csv').toString().split('\n');
// console.log(prodKeywords.length);
const allProductKeywords = prodKeywords.slice(1, prodKeywords.length - 1);

//There are 203 json files that has been scraped based on keywords. T
// The database says 211, but they are duplicates and can be ignored.
const existingKeywords = fs.readdirSync('product-list').filter(f => f.endsWith('.json')).map( f => f.replace('.json', '')).sort();
console.log(existingKeywords);

const missingItems = lodash.difference(allProductKeywords, existingKeywords);
console.log(missingItems);

// They are only duplicates and case sensitive. 203 files.
// [ "BBQ sauce", "Crisco", "Italian seasoning", "Navy beans", "Parmesan", "Parmesan cheese", "Pollock",
//   "Worcestershire sauce", "allspice", "almond", "apple", "apples", "bacon", "baking powder", "baking soda",
//   "bananas", "basil", "bay leaf", "bay leaves", "beans", "beef", "beets", "bell pepper", "bell peppers", "black beans",
//   "black pepper", "black peppercorns", "bottled water", "bread", "breadcrumbs", "broth", "brown rice",
//   "brown sugar", "bulgur", "buns", "butter", "buttermilk", "cabbage", "canned chickpeas", "canola", "capers",
//   "caraway seeds", "cardamom", "carrot", "carrots", "cauliflower", "cayenne", "celery", "cereal", "cheddar",
//   "cheddar cheese", "cheese", "chicken", "chickpeas", "chili", "chili pepper", "chili powder", "chives",
//   "cilantro", "cinnamon", "clams", "cloves", "coconut", "coconut milk", "coriander", "corn", "cornmeal", "cornstarch",
//   "couscous", "cranberries", "cream", "cream of chicken soup", "cucumber", "cumin", "curry", "curry powder",
//   "dill", "dressing", "edamame", "egg", "eggplant", "eggs", "fish", "flour", "food coloring", "garlic", "ghee", "ginger",
//   "grape juice", "green beans", "green onions", "ground beef", "ground black pepper", "ham", "honey",
//   "hot sauce", "jalapeno", "jalapenos", "jam", "kale", "ketchup", "lamb", "lemon", "lentils", "lettuce", "lime", "macaroni",
//   "mango", "margarine", "marjoram", "marmalade", "mayonnaise", "milk", "mint", "molasses", "mozzarella", "muffin",
//   "mushroom", "mushrooms", "mustard", "noodles", "nutmeg", "oat cereal", "oats", "oil", "olive oil", "olives",
//   "onion", "onions", "orange", "oregano", "panko", "papayas", "paprika", "parsley", "parsnips", "pasta", "pasta sauce",
//   "pastry", "peanut", "peanut butter", "peanuts", "peas", "pepper", "peppercorns", "peppers", "pickles", "pie shell",
//   "pineapple", "pork", "potato", "potatoes", "quinoa", "raisins", "red pepper", "red pepper flakes", "red peppers",
//   "relish", "rice", "rosemary", "sage", "salt", "sauce", "sausage", "savory", "scallion", "scallions", "seasoning",
//   "shallot", "shallots", "soda water", "soup", "sour cream", "soy sauce", "spice", "spices", "split peas", "spray",
//   "squash", "stock", "strawberries", "sugar", "sunflower seeds", "sweet potatoes", "taco shells", "thyme",
//   "tomato", "tomatoes", "tortillas", "tuna", "turkey", "turmeric", "vanilla", "vanilla extract", "vegetable oil",
//   "vegetables", "vermouth", "vinegar", "water", "wax beans", "wine", "yogurt", "zucchini" ]

// [ "Butter", "Cheddar cheese", "Cheddar Cheese", "Cumin", "Nutmeg", "Oil", "Soy sauce", "Vinegar" ]