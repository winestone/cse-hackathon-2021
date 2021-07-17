
## Setup
1. If using vscode, probably grab: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).
2. `npm i` to install dependencies.

## Development instructions
- Use `npm run back:watch` to run the backend and `npm run front:watch` for the frontend. They should both automatically restart whenever you change appropriate files. The server is hosted on http://localhost:8080/client by default (and also uses port 8081 for live reloading).
- The frontend is built into `dist/frontend/main.bundle.js` and gets hosted at http://localhost:8080/dist/frontend/main.bundle.js.
- The `static` folder gets hosted at http://localhost:8080/static.
- Any request starting with http://localhost:8080/client returns `static/index.html` which allows the frontend app to perform its own routing within the `/client` directory.
- The backend should probs serve everything from `http://localhost:8080/api`.
- `npm install --save-dev react react-dom` to install packages (in this case `react` and `react-dom`).
