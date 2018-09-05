var fs = require("fs");
var path = require("path");
var util = require("util");

fs.readFile = util.promisify(fs.readFile);
fs.readdir = util.promisify(fs.readdir);
fs.writeFile = util.promisify(fs.writeFile);

var PackageJSON = {
  homepage: "https://github.com/mini-eggs/wigly",
  bugs: "https://github.com/mini-eggs/wigly/issues",
  license: "MIT",
  repository: "https://github.com/mini-eggs/wigly",
  keywords: ["ui", "component", "reactive", "frontend", "jsx", "vdom", "virtual-dom", "declarative", "framework"]
};

async function copyLicense() {
  var data = await fs.readFile(path.join(__dirname, "../LICENSE.md"), "utf-8");
  var dir = await fs.readdir(path.join(__dirname, "../packages"), "utf-8");
  var promises = [];

  for (let pkg of dir) {
    promises.push(fs.writeFile(path.join(__dirname, "../packages", pkg, "LICENSE.md"), data, "utf-8"));
  }

  return await Promise.all(promises);
}

async function pkgJson() {
  var transfrom = json => JSON.stringify({ ...JSON.parse(json), ...PackageJSON }, null, 2);
  var dir = await fs.readdir(path.join(__dirname, "../packages"), "utf-8");

  for (let pkg of dir) {
    var src = path.join(__dirname, "../packages", pkg, "package.json");
    await fs.writeFile(src, transfrom(await fs.readFile(src, "utf-8")), "utf-8");
  }
}

async function main() {
  try {
    await copyLicense();
    await pkgJson();
  } catch (e) {
    process.stdout.write(e.toString() + "\n");
    process.exit(1);
  }
}

main();
