const { check } = require("express-validator");
var userModel = require("../models/user");

exports.Registrationvalidation = [
  check("fname")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("First Name Required!"),
  check("lname").not().isEmpty().trim().escape(),
  check("email").isEmail().normalizeEmail(),
  check("password").not().isEmpty().trim().escape(),
  check("email").custom(async (val) => {
    var user = await userModel.exists({ email: val });
    console.log(user);
    if (user == true) {
      throw new Error("Email Already Taken!");
    }
    return true;
  }),
];
exports.loginvalidation = [
  check("email").not().isEmpty().trim().escape(),
  check("password").not().isEmpty().trim().escape(),
];
