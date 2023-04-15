import fs from "fs";

const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf8"));

function processValue(value, tokens) {
  if (value.startsWith("{") && value.endsWith("}")) {
    const ref = value
      .slice(1, -1)
      .split(".")
      .reduce((obj, key) => obj[key], tokens);
    return processValue(ref.value, tokens);
  }
  return value;
}

function processTokens(obj, tokens, prefix = "", cssVariables = []) {
  for (const key in obj) {
    const value = obj[key];
    const newPrefix = prefix ? `${prefix}-${key}` : key;

    if (typeof value === "object" && !value.hasOwnProperty("value")) {
      processTokens(value, tokens, newPrefix, cssVariables);
    } else {
      const cssVarName = `--sd-${newPrefix}`;
      const cssVarValue = processValue(value.value, tokens);
      cssVariables.push(`${cssVarName}: ${cssVarValue};`);
    }
  }
  return cssVariables;
}

const paletteCssVariables = processTokens(tokens.global.palette, tokens.global);
const aliasCssVariables = processTokens(tokens.global.alias, tokens.global);

const paletteOutput = "css/palette.css";
const aliasOutput = "css/alias.css";

fs.writeFileSync(
  paletteOutput,
  `:root {\n  ${paletteCssVariables.join("\n  ")}\n}`,
  "utf8"
);
console.log(`Palette CSS Variables written to ${paletteOutput}`);

fs.writeFileSync(
  aliasOutput,
  `:root {\n  ${aliasCssVariables.join("\n  ")}\n}`,
  "utf8"
);
console.log(`Alias CSS Variables written to ${aliasOutput}`);
