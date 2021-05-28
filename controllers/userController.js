const { validationResult } = require("express-validator");

function createuser(req, res) {
  const errors = validationResult(req);
  if (errors) {
    res.render("register", { errors: errors.array() });
  } else {
  }
}

function login(req, res) {
  const errors = validationResult(req);
}

module.exports = {
  createuser,
  login,
};
