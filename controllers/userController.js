const { validationResult } = require("express-validator");

function createuser(req, res) {
  const errors = validationResult(req);
}

module.exports = {
  createuser,
};
