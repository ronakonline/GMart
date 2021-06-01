var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.user) {
    res.render("index");
  } else {
    console.log(req.user);
    res.render("index", req.user);
  }
});

module.exports = router;
