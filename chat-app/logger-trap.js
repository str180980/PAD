const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/logs", (req, res, next) => {
  console.log("Saving message");
  const date = new Date();
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  console.log(req.body);
  const message = req.body;
  message.time = time;
  fs.writeFile("./logs", JSON.stringify(message), {flag: "a"}, (err)=> {
    if(err) {
      console.log("Error: ");
      console.log(err);
      
    }
  })
});

app.listen(3030, err => {
  if (err) {
    console.log("CONECTION ERROR HERE");
  } else console.log("Connected on port 3030");
});
