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

//middelware to redirect user to home page if user is already logged in accessing other routes for login
function LoggedIn(req, res, next) {
  if (req.user) {
    res.redirect("/");
  } else {
    next();
  }
}

//middelware to refirect user to login page if user trying to access protected routes
function IsLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("login");
  }
}

router.get("/login", LoggedIn, (req, res) => {
  res.render("login", {
    message: req.flash("info"),
    error: req.flash("error"),
  });
  console.log(req.user);
});

router.get("/register", LoggedIn, (req, res) => {
  res.render("register", { message: req.flash("info") });
});

router.post(
  "/register",
  userValidation.Registrationvalidation,
  userController.createuser
);

router.get("/emailverify", IsLoggedIn, (req, res) => {
  //Checks if user email is in session
  if (req.session.email) {
    console.log(req.session);
    res.render("emailverify", { message: req.flash("resend") });
  } else {
    throw new Error("Something Went Wrong");
  }
});

router.get("/verifyemail", IsLoggedIn, userController.verifyemail);

router.get("/resendemail", IsLoggedIn, userController.resendemail);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "login",
    failureFlash: true,
  }),
  userController.login
);

router.get("/logout", IsLoggedIn, userController.logout);

router.get("/account", IsLoggedIn, (req, res) => {
  res.render("account", req.user);
});

router.get("/forgotpassword", LoggedIn, (req, res) => {
  res.render("forgotpassword", { error: req.flash("error") });
});

router.post("/forgotpassword", userController.forgotpassword);

router.get("/changenewpassword", LoggedIn, userController.changenewpassword);

router.post(
  "/changenewpassword",
  userValidation.confirmpassword,
  userController.updatenewpassword
);

router.get("/updatepassword", IsLoggedIn, (req, res) => {
  res.render("updatepassword", {
    message: req.flash("info"),
    error: req.flash("error"),
    first_name: req.user.first_name,
  });
});

router.post(
  "/updatepassword",
  IsLoggedIn,
  userValidation.confirmpassword,
  userController.updatepassword
);

router.get("/updateprofile", IsLoggedIn, (req, res) => {
  res.render("updateprofile", req.user);
});

router.post("/updateprofile", IsLoggedIn, userController.updateprofile);

module.exports = router;
