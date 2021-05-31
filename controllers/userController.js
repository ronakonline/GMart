const { validationResult } = require("express-validator");
var userModel = require("../models/user");
var randomToken = require("random-token");
const bcrypt = require("bcrypt");
var session = require("express-session");
const nodemailer = require("../config/email");
const saltRounds = 10;

function sendverificationmail(email, token) {
  //Sending a verification email to user
  let message = "<h1>Verify your account!</h1><p><a href='";
  message += `http://localhost:6969/user/verifyemail?email=${email}&token=${token}`;
  message += "'>click here</a></p>";
  var mailOptions = {
    from: "ronak@gmail.com",
    to: email,
    subject: "Email Verification",
    html: message,
  };
  nodemailer(mailOptions);
  return;
}

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
          code_verification: token,
        },
        (error, user) => {
          if (error) {
            console.log(error);
          } else {
            sendverificationmail(user.email, user.code_verification);
            req.session.email = user.email;
            res.redirect("emailverify");
          }
        }
      );
    });
  }
}

async function verifyemail(req, res) {
  const email = req.query.email;
  const token = req.query.token;

  const user = await userModel.findOne({
    email: email,
    code_verification: token,
  });
  if (user) {
    user.status = "Verified";
    await user.save();
    req.flash("info", "Account Verified!");
    console.log("User Verified!");
    res.redirect("login");
  } else {
    req.flash("error", "Invalid Verification Link!");
    console.log("Invalid Token!");
    res.redirect("login");
  }
}

async function resendemail(req, res) {
  userModel.findOne({ email: req.query.email }, (error, user) => {
    if (error) {
      console.log("error");
    } else {
      if (user) {
        sendverificationmail(user.email, user.code_verification);
        req.flash("resend", "Email sent");
        res.redirect("emailverify");
      }
    }
  });
}

function login(req, res) {
  if (req.user.status == "Pending") {
    sendverificationmail(req.user.email, req.user.code_verification);
    req.flash("error", "check your mailbox for verification");
    res.redirect("login");
  } else if (req.user.status == "Verified") {
    res.redirect("/");
  }
}

function logout(req, res) {
  req.logout();
  res.redirect("login");
}

module.exports = {
  createuser,
  login,
  verifyemail,
  resendemail,
  logout,
};
