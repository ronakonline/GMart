var express = require("express");
var router = express.Router();
const { validationResult } = require("express-validator");

var userModel = require("../models/user");
var userController = require("../controllers/userController");
var userValidation = require("../validation/userValidation");

router.get("/login", async (req, res) => {
  var users = await userModel.find();
  //  res.json(users);
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  userValidation.Registrationvalidation,
  userController.createuser
);
router.get(
  "/register",
  userValidation.loginvalidation,
  userController.curuser
);

module.exports = router;
