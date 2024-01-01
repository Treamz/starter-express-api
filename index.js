const express = require("express");
const app = express();
var cors = require("cors");
const uakino = require("./sources/uakino/uakino.js");
const axios = require("axios");

app.use(express.static("public"));
app.use(cors());

app.all("/", (req, res) => {
  res.send("OK");
});

app.get("/uakino/searchSuggestions/:query", (req, res) => {

  var result = uakino.getSuggestions(req.params.query);
  result.then((response) => res.send(response))
});

app.get("/uakino/getTranslations/:query", (req, res) => {
  var decoded = atob(req.params.query);

  var result = uakino.getTranslationByPage(decoded);
  result.then((response) => res.send(response))
});

app.get("/uakino/getTranslationById/:id", (req, res) => {

  var result = uakino.getTranslationById(req.params.id);
  result.then((response) => res.send(response))
});
app.listen(process.env.PORT || 3000);
