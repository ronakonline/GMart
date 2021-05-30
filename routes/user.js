var express = require("express");
var router = express.Router();
const { validationResult } = require("express-validator");
var flash = require("connect-flash");

var userModel = require("../models/user");
var userController = require("../controllers/userController");
var userValidation = require("../validation/userValidation");

router.get("/login", (req, res) => {
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

router.get("/emailverify", (req, res) => {
  //Checks if user email is in session
  if (req.session.email) {
    console.log(req.session);
    res.render("emailverify");
  } else {
    throw new Error("Something Went Wrong");
  }
});

router.post("/login", userValidation.loginvalidation, userController.login);

module.exports = router;
