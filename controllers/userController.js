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

//method to forgot password validate email and send change password verification link to email
async function forgotpassword(req, res) {
  await userModel.findOne({ email: req.body.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (user) {
        //Sending a verification email to user
        let message = "<h1>Verify your account!</h1><p><a href='";
        message += `http://localhost:6969/user/changenewpassword?email=${user.email}&token=${user.code_verification}`;
        message += "'>click here</a></p>";
        var mailOptions = {
          from: "ronak@gmail.com",
          to: user.email,
          subject: "Email Verification",
          html: message,
        };
        nodemailer(mailOptions);
        req.flash("success", "Password Link Send To Email");
        res.render("forgotpassword", {
          message: req.flash("success"),
        });
      } else {
        req.flash("notfound", "No Account Found!");
        res.render("forgotpassword", {
          error: req.flash("notfound"),
        });
      }
    }
  });
}

//method to change password after forgot password
async function changenewpassword(req, res) {
  email = req.query.email;
  token = req.query.token;

  var user = await userModel.exists({ email: email, code_verification: token });
  if (user == true) {
    req.session.email = email;
    res.render("changenewpassword");
  } else {
    req.flash("error", "Invalid Verficaiton Link");
    res.redirect("forgotpassword");
  }
}

//method to update new password
async function updatenewpassword(req, res) {
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("changenewpassword", { errors: errors.array() });
  } else {
    if (req.session.email) {
      hashpassword = bcrypt.hashSync(req.body.password, saltRounds);
      await userModel.findOne({ email: req.session.email }, (error, user) => {
        if (error) {
          console.log(error);
        } else {
          user.password = hashpassword;
          user.save();
          req.flash("info", "Password Changed!");
          res.redirect("login");
        }
      });
    } else {
      req.flash("error", "Try Again!");
      res.redirect("forgotpassword");
    }
  }
}

//method to update password from account page
async function updatepassword(req, res) {
  var errors = validationResult(req);
  var result = bcrypt.compareSync(req.body.oldpassword, req.user.password);
  if (result == false) {
    req.flash("error", "Incorrect Old Password!");
    res.redirect("updatepassword");
  } else {
    if (!errors.isEmpty()) {
      res.render("updatepassword", { errors: errors.array() });
    } else {
      await userModel.findOne({ email: req.user.email }, (error, user) => {
        if (error) {
          console.log(error);
        }
        if (user) {
          var hashpassword = bcrypt.hashSync(req.body.password, saltRounds);
          user.password = hashpassword;
          user.save();
          req.flash("info", "Password Updated!");
          res.redirect("updatepassword");
        } else {
          req.flash("Try Again!");
          res.redirect("updatepassword");
        }
      });
    }
  }
}

//method to update user profile data

async function updateprofile(req, res) {
  await userModel.findOne({ email: req.user.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      user.first_name = req.body.first_name;
      req.user.first_name = req.body.first_name;
      user.last_name = req.body.last_name;
      req.user.last_name = req.body.last_name;
      user.save();
      res.redirect("updateprofile");
    }
  });
}

module.exports = {
  createuser,
  login,
  verifyemail,
  resendemail,
  logout,
  forgotpassword,
  changenewpassword,
  updatenewpassword,
  updatepassword,
  updateprofile,
};
