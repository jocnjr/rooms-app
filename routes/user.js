const express = require("express");
const router = express.Router();
const User = require('../models/user');
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const uploadCloud = require('../config/cloudinary.js');


router.get("/users", (req, res, next) => {
  User.find()
    .then(users => {
      res.render("users/index", { users });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/user/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  User.findOne({ _id: userId })
    .then(user => {
      res.render("users/detail", { user } );
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/users/add", (req, res, next) => {
    let user = new User();
    user._id = null;
    res.render("users/form", { user });
});
  
router.post("/users/add", uploadCloud.single('image'), (req, res, next) => {
    const {
      fullName,
      email,
      password
    } = req.body;
  
    const imagUrl = null;

    if (req.file) {
      const imageUrl = req.file.url;
    }

    if (email == '' || password == '') {
      res.render('users/form', {
        msgError: `email and password can't be empty`
      })
      return;
    }
  
    User.findOne({ 'email': email })
    .then(user => {
      if (user !== null) {
        res.render("users/form", {
          msgError: "The email already exists!"
        });
        return;
      }
  
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
  
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let token = '';
      for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
      }

      
      const newUser = new User({
        fullName,
        email,
        password: hashPass,
        imageUrl,
        token
      });
  
      newUser.save()
      .then(user => {
        res.redirect("/users");
      })
      .catch(err => { throw new Error(err)});
    })
    .catch(err => { throw new Error(err)});
  
});
  
router.get("/users/edit/:id", (req, res, next) => {
    const userId = req.params.id
  
    User.findOne({ _id: userId })
      .then(user => {
        if (user._id.equals(req.user._id)) {
          res.render("users/form", { user });
        } else {
          // no access for you!
          res.redirect(`/user/${user._id}`);
        }
        
      })
      .catch(error => {
        throw new Error(error);
      });
});
  
router.post("/users/edit", uploadCloud.single('image'), (req, res, next) => {
    const userId = req.body.userId;
    let { name, email, password } = req.body;
  
    if (password) {
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
  
      password = hashPass;
    }

    const imageUrl = req.file.url;
  
    User.update(
      { _id: userId },
      { $set: { name, email, password, imageUrl } },
      { new: true } 
    )
      .then(user => {
        res.redirect(`/users`);
      })
      .catch(error => {
        throw new Error(error);
      });
});

router.get("/users/delete/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  User.findOne({ _id: userId })
    .then(user => {
      res.render("users/delete", { user, currentUser: req.user });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.post("/users/delete", (req, res, next) => {
  let userId = req.body.id;
  User.deleteOne({ _id: userId })
    .then(user => {
      res.render("users/delete", { message: `user ${user.name} deleted!`, currentUser: req.user });    
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
