var express = require("express");
var router = express.Router();
var userModel = require("../models/user");

router.get("/login", async (req, res) => {
  var users = await userModel.find();
  res.json(users);
  // res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

module.exports = router;
