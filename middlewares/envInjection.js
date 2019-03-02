const express = require('express');
const router  = express.Router();
require('dotenv').config();

const envInject = (req, res, next) => {
  res.locals.GMAPS = process.env.GMAPS;
  next();
}
module.exports = envInject;