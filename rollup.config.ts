import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import rollup from "rollup";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const extensions = [".js", ".json", ".ts", ".tsx"];

/** @type {import("rollup").RollupOptions} */
const options = {
  input: "src/frontend/main.tsx",
  output: {
    file: "dist/frontend/main.bundle.js",
    format: "iife", // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
    },
  },
  external: ["react", "react-dom"],
  plugins: [
    json(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development"),
      preventAssignment: true,
    }),
    resolve({
      browser: true,
      extensions,
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      tsconfig: "src/frontend/tsconfig.json",
    }),
    production && terser(), // minify, but only in production
    livereload({
      watch: "dist",
      port: 8081,
      delay: 300,
    }),
  ],
};

export default options;
