var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("hbs");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");

var app = express();

app.use(
  session({
    secret: "cats",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const publicpath = path.join(__dirname, "./public");

hbs.registerPartials(path.join(__dirname, "./views/partials"));
app.use(express.static(publicpath));

app.use("/", indexRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
