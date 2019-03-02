const express = require("express");
const router = express.Router();
const Room = require('../models/room');

router.get("/", (req, res, next) => {
  Room.find()
  .then(rooms => res.render('home', {rooms}))
  .catch(err => { throw new Error(err) })
});

module.exports = router;