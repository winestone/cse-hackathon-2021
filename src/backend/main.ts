import express from "express";
import expressWs from "express-ws";
import sqlite3 from "sqlite3";

import * as api from "@common/api";
import * as game from "./game";

const appWs = expressWs(express());
const { app } = appWs;
app.use(express.json());

const db = new sqlite3.Database("./data.db");

function dbGet<T = any>(sql: string, params: any): Promise<T> {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    })
  );
}

function dbAll<T = any>(sql: string, params: any): Promise<T[]> {
  return new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    })
  );
}

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

app.post("/api/register", async (req, res) => {
  const args: api.RegisterUsername = req.body;
  // Check that username doesn't already exist
  const qry = "SELECT username FROM users WHERE username = ?";
  const alreadyRegistered = await dbGet(qry, [args.name]);
  const reply: api.RegisterResult = { success: !alreadyRegistered };
  res.json(reply);
});

app.post("/api/login", async (req, res) => {
  const args: api.LoginUsername = req.body;
  // Check that username doesn't already exist
  const qry = "SELECT username FROM users WHERE username = ?";
  const alreadyRegistered = await dbGet(qry, [args.name]);
  const reply: api.LoginResult = { success: alreadyRegistered };
  res.json(reply);
});

app.post("/api/getUA", async (req, res) => {
  const args: api.User = req.body;
  const qry = "SELECT achievements FROM achievements WHERE username = ?";
  // let achieveList = undefined;
  console.log(args.name);
  const achieveList = await dbAll(qry, [args.name]);
  console.log(achieveList);
  // db.all(qry, [args.name], (err, row) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(row);
  //     console.log(typeof(row));
  //     achieveList = row;
  //   }
  // })
  const reply: api.userAchievements = { achievements: achieveList };
  res.json(reply);
});

app.use("/api/game", game.addRoutes(express.Router()));

app.listen(8080, () => {
  console.log("Server is running.");
});
