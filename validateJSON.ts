import fs from "fs";
import path from "path";

const recipeDir = "recipes-json-test";

let jsonFiles = fs.readdirSync(recipeDir).filter(file => file.endsWith('.json'));
let invalidFiles: string[] = [];
for (const file of jsonFiles) {
    let fileContent = fs.readFileSync(path.join(recipeDir, file));
    try {
        JSON.parse(fileContent.toString());
    } 
    catch (e) {
        invalidFiles.push(file);
        console.log('error: ', e);
    }    
}

console.log(invalidFiles);
