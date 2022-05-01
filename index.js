const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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
const userModel = mongoose.model('users');

app.use(cookieParser);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({}));

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello world!');
})

app.use('/', require('./routes'));

app.use((req, res, next) => {
  res.status(404).send('Resource not found!');
})

app.listen(port, () => {
  console.log('The server is running!');
})