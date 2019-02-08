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
app.put('/users/:id', (req, res) => {
  let id = req.params.id;
  let queryObject = {};
  if(req.body.email && req.body.email.length){
    queryObject.email = req.body.email;
  }
  if(req.body.age && req.body.age.length){
    queryObject.age = req.body.age;
  }
  if(req.body.password && req.body.password_confirmation && req.body.password.length && req.body.password === req.body.password_confirmation){
    queryObject.password = req.body.password;
  }
  if(Object.keys(queryObject).length){
    users.updateOne({_id: id},queryObject, (err, result) => {
        if(err) {
          return res.send('server error');
    }
          return res.send(result);
      });
    }else{
          return res.send('empty form');
    }
});
app.listen(6000);


//req.body.password && req.body.password_confirmation &&
  //password: req.body.password,
