const express = require("express");
const router = express.Router();
const Room = require('../models/room');
const uploadCloud = require('../config/cloudinary.js');
const ensureLogin = require("connect-ensure-login");


router.get("/rooms", (req, res, next) => {
  Room.find()
    .then(rooms => {
      rooms.forEach(room => {
        if (room.owner && req.user && room.owner.equals(req.user._id)) {
          room.owned = true;
        }
      });
      res.render("rooms/index", { rooms });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/room/:id", (req, res, next) => {
  let roomId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(roomId)) return res.status(404).send('not-found');
  Room.findOne({ _id: roomId })
    .populate({path: 'reviews', populate: { path: 'user' }})
    .then(room => {
      if (room.reviews.length > 0) {
        room.ratingAverage = Math.floor(room.reviews.reduce((acc, item) => acc + item.rating, 0) / room.reviews.length);
      } else {
        room.ratingAverage = 0;
      }
      res.render("rooms/detail", { room } );
    })
    .catch(error => {
      throw new Error(error);
    });
});


router.get("/rooms/add", ensureLogin.ensureLoggedIn(), (req, res, next) => {
    let room = new Room();
    room._id = null;
    res.render("rooms/form", { room });
});
  
router.post("/rooms/add", ensureLogin.ensureLoggedIn(), uploadCloud.single('image'), (req, res, next) => {
    const {
      name,
      description,
      latitude,
      longitude,
      owner
    } = req.body;
  
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.url;
    }

    const location = { 
      type: 'Point',
      coordinates: [longitude, latitude] 
    };

    const newRoom = new Room({
      name,
      description,
      location,
      imageUrl,
      owner
    });
  
    newRoom.save()
    .then(user => {
      res.redirect("/rooms");
    })
    .catch(err => { throw new Error(err)});
  
});
  
router.get("/rooms/edit/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
    const roomId = req.params.id
  
    Room.findOne({ _id: roomId })
      .then(room => {
        res.render("rooms/form", { room });
      })
      .catch(error => {
        throw new Error(error);
      });
});
  
router.post("/rooms/edit", ensureLogin.ensureLoggedIn(), uploadCloud.single('image'), (req, res, next) => {
    const {
      name,
      description,
      latitude,
      longitude,
      roomId
    } = req.body;
  
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.url;
    }
    
    const location = { 
      type: 'Point',
      coordinates: [longitude, latitude] 
    };

    Room.update(
      { _id: roomId },
      { $set: { name, description, location, imageUrl } },
      { new: true } 
    )
      .then(user => {
        res.redirect(`/rooms`);
      })
      .catch(error => {
        throw new Error(error);
      });
});

router.get("/rooms/delete/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  let roomId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(roomId)) return res.status(404).send('not-found');
  Room.deleteOne({ _id: roomId })
    .then(room => {
      res.redirect("/rooms");
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
