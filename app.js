require("dotenv").config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const favicon = require('serve-favicon');
const session = require("express-session");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
// const FacebookStrategy = require('passport-facebook').Strategy;
// const LocalStrategy = require("passport-local").Strategy;
// const User = require("./models/user");
const bcrypt = require("bcrypt");
const siteRoutes = require('./routes/index.js');

mongoose
  .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(error => {
    throw new Error(error);
  });

  // Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// Express View engine setup

hbs.registerHelper('if_equal', function (a, b, opts) {
  if (a == b) {
      return opts.fn(this) 
  } else { 
      return opts.inverse(this) 
  } 
});
hbs.registerHelper('if_not_equal', function (a, b, opts) {
  if (a != b) {
      return opts.fn(this) 
  } else { 
      return opts.inverse(this) 
  } 
});

hbs.registerPartials(__dirname + '/views/partials');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

// default value for title local
app.locals.title = 'Rooms App - The Review Project';

// injecting routes

app.use('/', siteRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Listening on http://localhost:${process.env.PORT}`);
  });
  
  module.exports = app;
