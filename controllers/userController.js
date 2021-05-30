const { validationResult } = require("express-validator");
var userModel = require("../models/user");
var randomToken = require("random-token");
const bcrypt = require("bcrypt");
var session = require("express-session");
const nodemailer = require("../config/email");
const saltRounds = 10;

async function createuser(req, res) {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    res.render("register", { errors: errors.array() });
  } else {
    var token = randomToken(16);
    console.log(token);
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      userModel.create(
        {
          email: req.body.email,
          first_name: req.body.fname,
          last_name: req.body.lname,
          password: hash,
          active: false,
          code_varification: token,
        },
        (error, user) => {
          if (error) {
            console.log(error);
          } else {
            //Sending a verification email to user
            let message = "<h1>Verify your account!</h1><p><a href='";
            message += `/verifyemail?email=${user.email}&token=${user.code_varification}`;
            message += "'>click here</a></p>";
            var mailOptions = {
              from: "ronak@gmail.com",
              to: user.email,
              subject: "Email Verification",
              html: message,
            };
            nodemailer(mailOptions);
            req.session.email = user.email;
            res.redirect("emailverify");
          }
        }
      );
    });
  }
}

function login(req, res) {
  const errors = validationResult(req);
  if (errors) {
    res.render("login", { errors: errors.array() });
  } else {
  }
}

module.exports = {
  createuser,
  login,
};
