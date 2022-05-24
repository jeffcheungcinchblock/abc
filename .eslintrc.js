module.exports = {
  env: {
    "jest/globals": true,
    browser: true,
    commonjs: true,
    es2021: true,
  },
  root: true,
  extends: ["@react-native-community"],
  // plugins: [ 'jest' ],

  rules: {
    "no-console": "off",
    semi: ["error", false],
    indent: ["error", "tab"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "always"],
    "react/require-default-props": ["error"],
    "react-hooks/exhaustive-deps": "warn", // <--- THIS IS THE NEW RULE
    "react/default-props-match-prop-types": ["error"],
    "react/sort-prop-types": ["error"],
    "comma-spacing": ["error", { before: false, after: true }],
  },
};
