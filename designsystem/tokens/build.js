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

function writeFileSyncWithMessage(path, data) {
  fs.writeFileSync(path, `:root {\n  ${data.join("\n  ")}\n}`, "utf8");
  console.log(`Palette CSS Variables written to ${path}`);
}

const paletteCssVariables = processTokens(tokens.global.palette, tokens.global);
const aliasCssVariables = processTokens(tokens.global.alias, tokens.global);
const fontSizeCssVariables = processTokens(
  tokens.global.fontSize,
  tokens.global
);

writeFileSyncWithMessage("css/palette.css", paletteCssVariables);
writeFileSyncWithMessage("css/alias.css", aliasCssVariables);
writeFileSyncWithMessage("css/fontSize.css", fontSizeCssVariables);
