module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "react-hooks", "import"],
  rules: {
    // "@typescript-eslint/array-type": ["error", { default: "generic" }],
    // "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-use-before-define": ["error"],
    "import/extensions": "off",
    "import/no-named-as-default-member": "warn",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    indent: "off",
    "default-case": "off",
    "max-classes-per-file": "off",
    "lines-between-class-members": "off",
    "no-bitwise": "off",
    "no-console": "off",
    "no-plusplus": "off",
    "no-shadow": "warn",
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    yoda: ["off"], // change to ["error", "onlyEquality"]
    // "prettier/prettier": "warn",
    "prettier/prettier": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".ts", ".tsx"],
      },
    ],
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
