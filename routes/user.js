require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require('../models/user');
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const uploadCloud = require('../config/cloudinary.js');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: process.env.MAILHOST,
  port: process.env.MAILPORT,
  auth: {
    user: process.env.MAILTRAPUSER,
    pass: process.env.MAILTRAPPASSWD
  }
});

router.get("/users", (req, res, next) => {
  User.find()
    .then(users => {
      users.forEach(user => {
        if (req.user && user._id.equals(req.user._id)) {
          user.owned = true;
        }
      });
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
  
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.url;
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
  
      let emailHTMLBody = `please confirm your email, click <a href="http://localhost:3000/confirm/${token}">here</a>`;

      newUser.save()
      .then(user => {
        transporter.sendMail({
          from: '"Rooms App" <noreply@roomsapp.com>',
          to: email, 
          subject: 'please, confirm your email - rooms app', 
          // text: message,
          html: `<b>${emailHTMLBody}</b>`
        })
        .then(info => res.redirect('/users'))
        .catch(err => { throw new Error(error)})
      })
      .catch(err => { throw new Error(err)});
    })
    .catch(err => { throw new Error(err)});
  
});
  
router.get("/users/edit/:id", (req, res, next) => {
    const userId = req.params.id
  
    User.findOne({ _id: userId })
      .then(user => {
        console.log(`${req.user}`);
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

router.get('/confirm/:token', (req, res) => {
  const { token } = req.params;

  User.findOneAndUpdate({ token }, {$set: {status: 'active'}}, { new: true })
  .then(user => {
    if (user.status === 'active') res.status(500).send('user already confirmed');

    (user) ? res.render("users/confirmation", { user }) : res.status(500).send('user not found');
  })
  .catch(err => { throw new Error(err) });

});

router.get('/send/confirmation', (req, res) => {
  res.render("users/confirmation-send");
});

router.post('/send/confirmation', (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
  .then(user => {
    if (!user) res.render("users/confirmation-send", { msgError: 'user not found' });
    
    let emailHTMLBody = `please confirm your email, click <a href="http://localhost:3000/confirm/${user.token}">here</a>`;

    transporter.sendMail({
      from: '"Rooms App" <noreply@roomsapp.com>',
      to: user.email, 
      subject: 'please, confirm your email - rooms app', 
      // text: message,
      html: `<b>${emailHTMLBody}</b>`
    })
    .then(info => res.render("users/confirmation-send", { msgError: 'a new email confirmation has been sent' }))
    .catch(err => { throw new Error(err)})
    
  })
  .catch(err => { throw new Error(err) });

});

router.get("/users/delete/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  User.deleteOne({ _id: userId })
    .then(user => {
      res.redirect("/users");    
    })
    .catch(error => {
      throw new Error(error);
  });
});

module.exports = router;
