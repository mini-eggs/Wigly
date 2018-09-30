var wigly = require("wigly");

function ssr(node) {
  if (typeof node === "string" || typeof node === "number") {
    return node;
  }

  if (node.tag === "#") {
    return "";
  }

  let attr = "";
  for (let name in node.attr) {
    let val = node.attr[name];
    if (name === "key" || (name[0] === "o" && name[1] === "n") || name === "children") {
    } else if (name === "style" && typeof val !== "string") {
      let next = "";
      for (let key in val) {
        let formattedKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        let formattedVal = val[key].replace(/([A-Z])/g, "-$1").toLowerCase();
        next += `${formattedKey}:${formattedVal};`;
      }
      attr += ` style="${next}"`;
    } else if (val !== false && val !== undefined && val !== null) {
      attr += ` ${name}="${val}"`;
    }
  }

  return `<${node.tag}${attr}>${node.children.map(ssr).join("")}</${node.tag}>`;
}

module.exports = component => wigly.render(component, undefined, (_a, _b, _c, node) => ssr(node));
