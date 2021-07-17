import express from "express";

import * as api from "@common/api";

const app = express();
app.use(express.json());

app.get("/api/example", (req, res) => {
  const reply: api.ExampleGetResult = "example reply";
  res.json(reply);
});

app.post("/api/example", (req, res) => {
  const args: api.ExamplePostArgs = req.body;
  const reply: api.ExamplePostResult = { reply: `Hello ${args.name ?? "mysterious user"}` };
  res.json(reply);
});

app.use("/client", (_req, res) => {
  res.sendFile("./static/index.html", { root: "./" });
});
app.use("/dist", express.static("./dist"));
app.use("/static", express.static("./static"));

app.listen(8080, () => {
  console.log("Server is running.");
});
