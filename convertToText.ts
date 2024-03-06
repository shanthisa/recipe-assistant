import {exec} from "child_process";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
// pandoc /Users/vagmi/Downloads/muffins.docx -o muffinsnew.txt

const recipesDocxDir = "recipes-docx";
const recipesTxtDir = "recipes-txt";

let files = await fs.promises.readdir(recipesDocxDir);

let docxFiles = files.filter(file => path.extname(file) === ".docx");

for (const file of docxFiles) {
    const docxFile = path.join(recipesDocxDir, file);
    const txtFile = path.join(recipesTxtDir, path.basename(file, ".docx") + ".txt");
    const cmd = `pandoc "${docxFile}" -o "${txtFile}"`;
    exec(cmd, (err, _stdout, _stderr) => {
        if(err) console.log('error in converting to txt: ', err);
    } )
}



