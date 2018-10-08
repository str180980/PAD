const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/timestamps", (req, res, next) => {
  const data = req.body;
  const currentDate = new Date();
  data.message = `TI152:${data.message}`;
  return res.send(data.message);
});

app.listen(3000, err => {
  if (err) {
    console.log("CONECTION ERROR HERE");
  } else console.log("Connected on port 3000");
});
