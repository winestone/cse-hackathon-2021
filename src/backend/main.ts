import express from "express";
import expressWs from "express-ws";

import * as api from "@common/api";
import * as game from "./game";

const appWs = expressWs(express());
const { app } = appWs;
app.use(express.json());

app.use("/client", (_req, res) => {
  res.sendFile("./static/index.html", { root: "./" });
});
app.use("/dist", express.static("./dist"));
app.use("/static", express.static("./static"));

app.get("/api/example", (req, res) => {
  const reply: api.ExampleGetResult = "example reply";
  res.json(reply);
});

app.post("/api/example", (req, res) => {
  const args: api.ExamplePostArgs = req.body;
  const reply: api.ExamplePostResult = { reply: `Hello ${args.name ?? "mysterious user"}` };
  res.json(reply);
});

app.use("/api/game", game.addRoutes(express.Router()));

app.listen(8080, () => {
  console.log("Server is running.");
});
