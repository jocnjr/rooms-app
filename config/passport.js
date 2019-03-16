require("dotenv").config();
const express = require("express");
const app = express();
const User = require('../models/user');
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const FacebookStrategy = require('passport-facebook').Strategy;
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");


app.use(session({
    secret: "books-app",
    store: new MongoStore({ url: process.env.MONGODB_URI }),
    resave: true,
    saveUninitialized: true
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) { return done(err); }
      done(null, user);
    });
  });
  
  app.use(flash());
  
  passport.use(new LocalStrategy({
    passReqToCallback: true
  },(req, username, password, done) => {
    User.findOne({ email: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: "Incorrect password" });
      }

      if (user.status === 'pending') {
        return done(null, false, { message: 'Please, confirm your account <a href="/confirm/send"> here</a>'});
      }
  
      return done(null, user);
    });
  }));

  passport.use(new FacebookStrategy({
    clientID: process.env.facebookClientID,
    clientSecret: process.env.facebookClientSecret,
    callbackURL: `${process.env.APP_HOST}/auth/facebook/callback`
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookID: profile.id })
    .then((user, err) => {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, user);
      }

      const newUser = new User({
        email: profile.email,
        fullName: profile.displayName,
        facebookID: profile.id,
        status: 'active'
      });
  
      newUser.save()
      .then(user => {
        done(null, user);
      })
    })
    .catch(error => {
      done(error)
    })
  }
  ));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use((req, res, next) => {
    if (req.isAuthenticated()) {
      res.locals.currentUser = req.user;
    }
  
    next();
  });

  module.exports = app;