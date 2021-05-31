var express = require("express");
var router = express.Router();
const { validationResult } = require("express-validator");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var userModel = require("../models/user");
var userController = require("../controllers/userController");
var userValidation = require("../validation/userValidation");
const bcrypt = require("bcrypt");

passport.serializeUser(function (user, done) {
  done(null, user.email);
});
passport.deserializeUser(function (email, done) {
  userModel.findOne(
    {
      email: email,
    },
    function (err, user) {
      done(err, user);
    }
  );
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (email, password, done) {
      var isValidPassword = function (userpass, password) {
        return bcrypt.compareSync(password, userpass);
      };
      userModel.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "No user found" });
        }
        if (!isValidPassword(user.password, password)) {
          return done(null, false, { message: "Incorrect Password!" });
        }
        return done(null, user);
      });
    }
  )
);

router.get("/login", (req, res) => {
  res.render("login", {
    message: req.flash("info"),
    error: req.flash("error"),
  });
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

router.get("/verifyemail", userController.verifyemail);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "login",
    failureFlash: true,
  }),
  userController.login
);

module.exports = router;
