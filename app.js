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
const envInjector = require('./middlewares/envInjection');
const siteRoutes = require('./routes/index');
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');
const apiRoutes = require('./routes/api');
const reviewRoutes = require('./routes/review');
const authRoutes = require('./routes/auth');
const passportConfig = require('./config/passport.js');
const ensureLogin = require("connect-ensure-login");



mongoose
  .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
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
app.use(envInjector);

// Express View engine setup

hbs.registerPartials(__dirname + '/views/partials');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));


// passport and session config
app.use(passportConfig);

// default value for title local
app.locals.title = 'Rooms App - The Review Project';

// injecting routes

app.use('/', siteRoutes);
app.use('/', apiRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', roomRoutes);
app.use('/', reviewRoutes);


// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});
  
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on http://localhost:${process.env.PORT}`);
});
  
  module.exports = app;
