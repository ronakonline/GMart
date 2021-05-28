var express = require("express");
var router = express.Router();
const { validationResult } = require("express-validator");
var flash = require("connect-flash");

var userModel = require("../models/user");
var userController = require("../controllers/userController");
var userValidation = require("../validation/userValidation");

router.get("/login", async (req, res) => {
  var users = await userModel.find();
  //  res.json(users);
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register", { message: req.flash("info") });
});

router.post(
  "/register",
  userValidation.Registrationvalidation,
  userController.createuser
);

router.post("/login", userValidation.loginvalidation, userController.login);

module.exports = router;
