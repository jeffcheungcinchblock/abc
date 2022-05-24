module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-console": "off",

    indent: ["error", 2],
    "import/no-extraneous-dependencies": "off",
    "no-plusplus": "off",
    bracketSameLine: true,
    singleQuote: true,
    arrowParens: "avoid",
    bracketSpacing: true,
    requirePragma: false,
    trailingComma: "all",
    semi: false,
  },
};
