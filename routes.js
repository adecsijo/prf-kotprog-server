const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const passport = require('passport');

router.route('/login').post((req, res, next) => {
  if(req.body.username && req.body.password) {
    passport.authenticate('local', function(error, user) {
      if(error) return res.status(500).send({error: error});
      req.logIn(user, function(error) {
        if(error) return res.status(500).send({error: error});
        return res.status(200).send('Sikeres bejelentkezés!')
      })
    })(req, res);
  } else {
    return res.status(400).send('Sikeres bejelentkezés!');
  }
});

router.route('/logout').post((req, res, next) => {
  if(req.isAuthenticated) {
    req.logOut();
    return res.status(200).send('Sikeres kijelentkezés!');
  } else {
    return res.status(403).send('Sikertelen kijelentkezés, nincs bejelentkezett felhasználó!');
  }
});

router.route('/user').get((req, res, next) => {
  userModel.find({}, (err, users) => {
    if(err) return res.status(500).send('DB hiba');
    res.status(200).send(users);
  })
}).post((req, res, next) => {
  if(req.body.username && req.body.password) {
    userModel.findOne({username: req.body.username}, (err, user) => {
      if(err) return res.status(500).send('DB hiba!');
      if(user) return res.status(400).send('Ilyen felhasználó már létezik!');
      const usr = new userModel({username: req.body.username, password: req.body.password, accessLevel: 'basic'});
      usr.save((error) => {
        if(error) return res.status(500).send('Hiba a mentés során!');
        return res.status(200).send('Sikeres mentés');
      })
    });
  } else {
    return res.status(400).send('Hibás kérés, username és password kell!');
  }
}).put((req, res, next) => {
  if(req.body.username && req.body.password) {
    userModel.findOne({username: req.body.username}, (err, user) => {
      if(err) return res.status(500).send('DB hiba!');
      if(user) {
        user.password = req.body.password;
        if(req.isAuthenticated && req.session.passport.user.accessLevel == 'admin') user.accessLevel = req.body.accessLevel;
        user.save((error) => {
          if(error) return res.status(500).send('Probléma a módosítás során!');
          return res.status(200).send('Sikeres módosítás!');
        })
      } else {
        return res.status(500).send('Nincs ilyen felhasználó az adatbázisban!');
      }
    });
  } else {
    return res.status(400).send('Hibás kérés, username és password kell!');
  }
}).delete((req, res, next) => {
  if(req.body.username) {
    userModel.findOne({username: req.body.username}, (err, user) => {
      if(err) return res.status(500).send('DB hiba!');
      if(user) {
        user.delete((error) => {
          if(error) return res.status(500).send('Probléma a törlés során!');
          return res.status(200).send('Sikeres törlés!');
        })
      } else {
        return res.status(500).send('Nincs ilyen felhasználó az adatbázisban!');
      }
    })
  } else {
    return res.status(400).send('Nem adott meg felhasználónevet!');
  }
})

module.exports = router;