let path = require("path");
let fs = require("fs");

let inputs = ["../dist/es5.js", "../dist/es6.js"];

let licence = fs.readFileSync(path.join(__dirname, "../LICENCE.md"), "utf-8");
licence = format(licence);

for (let input of inputs) {
  appendLicense(licence, input);
}

function appendLicense(license, loc) {
  let file = fs.readFileSync(path.join(__dirname, loc), "utf-8");
  let filename = loc.split(".js").join("-with-license.js");
  fs.writeFileSync(path.join(__dirname, filename), `${license}\n${file}`, "utf-8");
}

function format(license) {
  let lines = licence.split("\n");
  let output = "/**";
  for (let line of lines) output += ` * ${line}\n`;
  output += " */";
  return output;
}
