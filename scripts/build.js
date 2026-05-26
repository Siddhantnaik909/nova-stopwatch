import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import vm from "node:vm";

const requiredFiles = ["index.html", "style.css", "app.js"];

async function assertFileExists(file) {
  await access(file, constants.R_OK);
}

async function assertHtmlLinksAssets() {
  const html = await readFile("index.html", "utf8");
  for (const asset of ["style.css", "app.js"]) {
    if (!html.includes(asset)) {
      throw new Error(`index.html does not reference ${asset}`);
    }
  }
}

async function assertJavaScriptParses() {
  const source = await readFile("app.js", "utf8");
  new vm.Script(source, { filename: "app.js" });
}

for (const file of requiredFiles) {
  await assertFileExists(file);
}

await assertHtmlLinksAssets();
await assertJavaScriptParses();

console.log("Build check passed.");
