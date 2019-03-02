const express = require("express");
const router = express.Router();
const Review = require('../models/review');
const Room = require('../models/room');
const ensureLogin = require("connect-ensure-login");

router.post("/reviews/add", ensureLogin.ensureLoggedIn(), (req, res, next) => {
    const {
      user,
      comment,
      rating,
      roomId
    } = req.body;

    if (req.file) {
      imageUrl = req.file.url;
    }

    const newReview = new Review({
      user,
      comment,
      rating
    });
  
    newReview.save()
    .then(review => {
      console.log(review._id, roomId)
      Room.updateOne({_id: roomId}, { $push: { reviews: review._id }})
      .then(room => {
        res.redirect(`/room/${roomId}`);
      })
      .catch(err => { throw new Error(err) })
    })
    .catch(err => { throw new Error(err)});
  
});

module.exports = router;
