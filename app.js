const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const Userschema = require('./model');

const users_db = mongoose.createConnection("mongodb://localhost:27017/users", { useNewUrlParser: true });

const users = users_db.model('users', Userschema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/users', (req, res) => {
  if(req.query){
    let q = req.query.q;
    users.find({ $or:[ {'username': new RegExp(q,'i')}, {'email':new RegExp(q,'i')}]},
      (err, result) => {
        if(err) {
          return res.send('server error');
        }
          return res.send(result);
      });
  }
});
app.post('/users', (req, res) => {
  if(req.body.username && req.body.password && req.body.email && req.body.age){
    users.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    age: req.body.age
  }, (err, result) => {
      if(err) {
        return res.send('server error');
      }
        return res.send(result);
    });
  }
});
app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  users.findOne({
      _id: id
    }, (err, result) => {
        if(err) {
          return res.send('server error');
        }
          return res.send(result);
      });
});

app.listen(6000);
