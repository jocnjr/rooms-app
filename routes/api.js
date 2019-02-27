const express = require("express");
const router = express.Router();
const Room = require('../models/room');


router.get("/api/rooms", (req, res, next) => {
  Room.find()
    .then(rooms => {
        res.status(200).json({ rooms });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/api/room/:id", (req, res, next) => {
    const roomId = req.params.id;
    Room.findOne({_id: roomId})
        .then(room => {
            res.status(200).json({ room });
        })
        .catch(error => {
        throw new Error(error);
        });
});

module.exports = router;
