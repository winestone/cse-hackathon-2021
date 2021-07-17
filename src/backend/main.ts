import express from "express";
import * as api from "@common/api";
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json());

let db = new sqlite3.Database('./data.db');

app.get("/api/example", (req, res) => {
  const reply: api.ExampleGetResult = "example reply";
  res.json(reply);
});

app.post("/api/example", (req, res) => {
  const args: api.ExamplePostArgs = req.body;
  const reply: api.ExamplePostResult = { reply: `Hello ${args.name ?? "mysterious user"}` };
  res.json(reply);
});

app.post("/api/register", (req, res) => {
  const args: api.RegisterUsername = req.body; 
  //Check that username doesn't already exist 
  let successRegister = true;
  let qry = 'SELECT username FROM users where username = ?';
  db.get(qry, [args.name], (err, row)=>{
    if (err){
      console.log(err);
      return; 
    }
    if (row) {
      successRegister = false;
    }
  }
  
  )
  const reply: api.RegisterResult = { success: successRegister }; 
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
