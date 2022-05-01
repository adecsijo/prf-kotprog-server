const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true, lowercase: true},
  password: {type: String, required: true},
  accessLevel: {type: String}
}, {collection: 'users'});

userSchema.pre('save', function(next) {
  const user = this;
  if(user.isModified('password')) {
    user.accessLevel = 'basic';
    bcrypt.genSalt(10, function(err, salt) {
      if(error) {
        console.log('Hiba a salt generálása során');
        return next(error);
      }
      bcrypt.hash(user.password, salt, function(error, hash) {
        if(error) {
          console.log('Hiba a hashelés során!');
          return next(error);
        }
        user.password = hash;
        return next();
      })
    })
  } else {
    return next();
  }
})

mongoose.model('users', userSchema);