const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');

const app = express();

const port = process.env.PORT || 3000;
const dbUrl = 'mongodb+srv://adecsijo:mongo-pass@cluster0.zzsnk.mongodb.net/kotprog?retryWrites=true&w=majority';

mongoose.connect(dbUrl);

mongoose.connection.on('connected', () => {
  console.log('DB csatlakoztatva');
})

mongoose.connection.on('error', (err) => {
  console.log('Hiba történt', err);
})

require('./user.model');
require('./book.model');
require('./cart.model');
const userModel = mongoose.model('user');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

const whitelist = ['https://prf-kotprog-client.herokuapp.com', 'http://localhost:4200'];

var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin',
    'Origin', 'Accept'
  ]
};

app.use(cors(corsOptions));

passport.use('local', new localStrategy(function(username, password, done) {
  userModel.findOne({ username: username }, function(err, user) {
    if (err) return done('Hiba a lekérés során', null);
    if (!user) return done('Nincs ilyen felhasznaló', null);
    user.comparePasswords(password, function(error, isMatch) {
      if (error) return done(error, false);
      if (!isMatch) return done('Hibás jelszó', false);
      return done(null, user);
    });
  });
}));

passport.serializeUser(function(user, done) {
  if (!user) return done('Nincs megadva beléptethető felhasználó');
  return done(null, user);
});

passport.deserializeUser(function(user, done) {
  if (!user) return done('Nincs kiléptethető felhasználó', null);
  return done(null, user);
});

app.use(expressSession({ secret: 'prf-kotprog2022', resave: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));

app.use((req, res, next) => {
  res.status(404).send('Resource not found!');
})

app.listen(port, () => {
  console.log('The server is running! Port: ' + port);
})