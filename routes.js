const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userModel = mongoose.model('users');

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
      const usr = new userModel({username: req.body.username, password: req.body.password});
      usr.save((error) => {
        if(error) return res.status(500).send('Hiba a mentés során!');
        return res.status(200).send('Sikeres mentés');
      })
    });
  } else {
    return res.status(400).send('Hibás kérés, username és password kell!');
  }
}).put((req, res, next) => {

}).delete((req, res, next) => {

})

module.exports = router;