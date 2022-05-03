const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const passport = require('passport');
const bookModel = mongoose.model('book');
const cartModel = mongoose.model('cart');

router.route('/login').post((req, res, next) => {
  if (req.body.username && req.body.password) {
    passport.authenticate('local', function(error, user) {
      if (error) return res.status(500).send({ error: error });
      req.logIn(user, function(error) {
        if (error) return res.status(500).send({ error: error });
        return res.status(200).send({ msg: 'Sikeres bejelentkezés!' })
      })
    })(req, res);
  } else {
    return res.status(400).send({ msg: 'Sikertelen bejelentkezés!' });
  }
});

router.route('/logout').post((req, res, next) => {
  if (req.isAuthenticated()) {
    req.logout();
    return res.status(200).send({ msg: 'Sikeres kijelentkezés!' });
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
});

router.route('/user').get((req, res, next) => {
  if (req.isAuthenticated() && req.session.passport.user.accessLevel == 'admin') {
    userModel.find({}, (err, users) => {
      if (err) return res.status(500).send({ msg: 'DB hiba' });
      res.status(200).send(users);
    })
  }
}).post((req, res, next) => {
  if (req.body.username && req.body.password) {
    userModel.findOne({ username: req.body.username }, (err, user) => {
      if (err) return res.status(500).send({ msg: 'DB hiba' });
      if (user) return res.status(400).send({ msg: 'Ilyen felhasználó már létezik!' });
      const usr = new userModel({ username: req.body.username, password: req.body.password, accessLevel: 'basic' });
      usr.save((error) => {
        if (error) return res.status(500).send({ msg: 'Hiba a mentés során!' });
        return res.status(200).send({ msg: 'Sikeres mentés' });
      })
    });
  } else {
    return res.status(400).send({ msg: 'Hibás kérés, username és password kell!' });
  }
}).put((req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.body.password) {
      userModel.findOne({ username: req.session.passport.user.username }, (err, user) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        if (user) {
          user.password = req.body.password;
          if (req.session.passport.user.accessLevel !== 'admin' && req.body.accessLevel) {
            return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
          } else if (req.session.passport.user.accessLevel == 'admin' && req.body.accessLevel) {
            user.accessLevel = req.body.accessLevel
          }
          user.save((error) => {
            if (error) return res.status(500).send({ msg: 'Probléma a módosítás során!' });
            return res.status(200).send({ msg: 'Sikeres módosítás!' });
          })
        } else {
          return res.status(500).send({ msg: 'Nincs ilyen felhasználó az adatbázisban!' });
        }
      });
    } else {
      return res.status(400).send({ msg: 'Hibás kérés, username és password kell!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
}).delete((req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.body.username) {
      userModel.findOne({ username: req.body.username }, (err, user) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        if (user) {
          user.delete((error) => {
            if (error) return res.status(500).send({ msg: 'Probléma a törlés során!' });
            return res.status(200).send({ msg: 'Sikeres törlés!' });
          })
        } else {
          return res.status(500).send({ msg: 'Nincs ilyen felhasználó az adatbázisban!' });
        }
      })
    } else {
      return res.status(400).send({ msg: 'Nem adott meg felhasználónevet!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
});

router.route('/book').get((req, res, next) => {
  if (req.isAuthenticated()) {
    bookModel.find({}, (err, books) => {
      if (err) return res.status(500).send({ msg: 'DB hiba' });
      res.status(200).send(books);
    })
  }
}).post((req, res, next) => {
  if (req.isAuthenticated() && req.session.passport.user.accessLevel == 'admin') {
    if (req.body.ISBN && req.body.title && req.body.author && req.body.description && req.body.price) {
      bookModel.findOne({ ISBN: req.body.ISBN }, (err, book) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        if (book) return res.status(400).send({ msg: 'Ilyen könyv már létezik!' });
        const bk = new bookModel({ ISBN: req.body.ISBN, title: req.body.title, author: req.body.author, description: req.body.description, price: req.body.price });
        bk.save((error) => {
          if (error) return res.status(500).send({ msg: 'Hiba a mentés során!' });
          return res.status(200).send({ msg: 'Sikeres mentés' });
        })
      });
    } else {
      return res.status(400).send({ msg: 'Hibás kérés, title, author, description és price kell!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
}).put((req, res, next) => {
  if (req.isAuthenticated() && req.session.passport.user.accessLevel == 'admin') {
    if (req.body.ISBN) {
      bookModel.findOne({ ISBN: req.body.ISBN }, (err, book) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        if (book) {
          if (req.body.title) book.title = req.body.title;
          if (req.body.author) book.author = req.body.author;
          if (req.body.description) book.description = req.body.description;
          if (req.body.price) book.price = req.body.price;
          book.save((error) => {
            if (error) return res.status(500).send({ msg: 'Probléma a módosítás során!' });
            return res.status(200).send({ msg: 'Sikeres módosítás!' });
          })
        } else {
          return res.status(500).send({ msg: 'Nincs ilyen könyv az adatbázisban!' });
        }
      });
    } else {
      return res.status(400).send({ msg: 'Hibás kérés, ISBN kötelező!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
}).delete((req, res, next) => {
  if (req.isAuthenticated() && req.session.passport.user.accessLevel == 'admin') {
    if (req.body.ISBN) {
      bookModel.findOne({ ISBN: req.body.ISBN }, (err, book) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        if (book) {
          book.delete((error) => {
            if (error) return res.status(500).send({ msg: 'Probléma a törlés során!' });
            return res.status(200).send({ msg: 'Sikeres törlés!' });
          })
        } else {
          return res.status(500).send({ msg: 'Nincs ilyen könyv az adatbázisban!' });
        }
      })
    } else {
      return res.status(400).send({ msg: 'Hibás kérés, ISBN kötelező!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
});

router.route('/cart').get((req, res, next) => {
  if (req.isAuthenticated()) {
    cartModel.findOne({ username: req.session.passport.user.username }, (err, cart) => {
      if (err) return res.status(500).send({ msg: 'DB hiba' });
      if (!cart) return res.status(400).send({ msg: 'A kosár még üres!' });
      return res.status(200).send(cart);
    })
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
}).post((req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.body.ISBN) {
      const username = req.session.passport.user.username;
      cartModel.findOne({ username: username }, (err, cart) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        bookModel.findOne({ ISBN: req.body.ISBN }, (error, book) => {
          if (error) res.status(400).send({ msg: 'Nincs ilyen könyv az adatbázisban!' });
          if (!cart) {
            const c = new cartModel({
              username: username,
              items: [{
                ISBN: book.ISBN,
                title: book.title,
                author: book.author,
                description: book.description,
                price: book.price
              }],
              total: book.price
            });
            c.save((erro) => {
              if (erro) {
                console.log(erro);
                return res.status(500).send({ msg: 'Hiba a mentés során!' });
              }
              return res.status(200).send(c);
            })
          } else {
            cart.items.push(book);
            cart.total = cart.total + book.price;
            cart.save((err) => {
              if (err) return res.status(500).send({ msg: 'Hiba a mentés során!' });
              return res.status(200).send(cart);
            })
          }
        })
      })
    } else {
      return res.status(400).send({ msg: 'Hibás kérés, ISBN kötelező!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
}).delete((req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.body.ISBN) {
      cartModel.findOne({ username: req.session.passport.user.username }, (err, cart) => {
        if (err) return res.status(500).send({ msg: 'DB hiba' });
        if (cart) {
          bookModel.findOne({ ISBN: req.body.ISBN }, (error, book) => {
            if (error) res.status(400).send({ msg: 'Nincs ilyen könyv az adatbázisban!' });
            const newItems = [];
            let first = true;
            for (let i = 0; i < cart.items.length; i++) {
              if (cart.items[i].ISBN === book.ISBN && first) {
                first = false;
              } else {
                newItems.push(cart.items[i]);
              }
            }
            cart.items = newItems;
            cart.total = cart.total - book.price;
            cart.save((error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ msg: 'Hiba a törlés során!' });
              }
              return res.status(200).send(cart);
            })
          })
        } else {
          return res.status(400).send({ msg: 'Hiba a kosár még üres!' });
        }
      })
    } else {
      return res.status(400).send({ msg: 'Hibás kérés, ISBN kötelező!' });
    }
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
})

router.route(('/payment')).post((req, res, next) => {
  if (req.isAuthenticated()) {
    cartModel.findOne({ username: req.session.passport.user.username }, (err, cart) => {
      if (err) return res.status(500).send({ msg: 'DB hiba' });
      if (cart) {
        cart.delete((error) => {
          if (error) return res.status(500).send({ msg: 'Probléma a fizetés során!' });
          return res.status(200).send({ msg: 'Tegyük fel, hogy sikeresen megvetted, amit a kosaradba tettél!' });
        })
      }
    })
  } else {
    return res.status(403).send({ msg: 'Művelet nem engedélyezett!' });
  }
})

module.exports = router;