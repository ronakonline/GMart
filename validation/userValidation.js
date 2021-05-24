const { check } = require("express-validator");

exports.Registrationvalidation = [
  check("fname").not().isEmpty().trim().escape(),
  check("lname").not().isEmpty().trim().escape(),
  check("email").isEmail().normalizeEmail(),
  check("password").not().isEmpty().trim().escape(),
];
