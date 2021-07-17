import express from "express";
import * as api from "@common/api";
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json());

let db = new sqlite3.Database('./data.db');

function dbGet<T = any>(sql: string, params: any): Promise<T> {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => {
    if (err) reject(err);
    resolve(row);
  }));
}

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
  //Check that username doesn't already exist 
  let qry = 'SELECT username FROM users WHERE username = ?';
  const alreadyRegistered = await dbGet(qry, [args.name]);
  const reply: api.RegisterResult = { success: !alreadyRegistered }; 
  res.json(reply);
})

app.post("/api/login", async (req, res) => {
  const args: api.LoginUsername = req.body; 
  //Check that username doesn't already exist 
  let qry = 'SELECT username FROM users WHERE username = ?';
  const alreadyRegistered = await dbGet(qry, [args.name]);
  const reply: api.LoginResult = { success: alreadyRegistered }; 
  res.json(reply);
})

app.use("/client", (_req, res) => {
  res.sendFile("./static/index.html", { root: "./" });
});
app.use("/dist", express.static("./dist"));
app.use("/static", express.static("./static"));

app.listen(8080, () => {
  console.log("Server is running.");
});
