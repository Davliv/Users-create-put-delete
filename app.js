const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validation = require('./class');
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
          return res.send({success:false,msg:'server error'}).status(500);
        }
          return res.send(result).status(200);
      });
  }
});

app.post('/users', (req, res) => {
  if(req.body.username && req.body.password && req.body.email && req.body.age){
    if(!validation.validateEmail(req.body.email)){
      return res.send({success:false,msg:'Not valid email'}).status(400);
    }else{
      const findUser = async function (params) {
        try {  return await users.findOne(params)
        }catch(err) { return res.send({success:false,msg:'Server error'}).status(500); }
      }
      const result = findUser({email: req.body.email})
      if(result){
         return res.send({success:false,msg:'Email allready is used'}).status(400);
      }
    }
    if(!validation.validatePassword(req.body.password)){
      return res.send({success:false,msg:'Not valid password'}).status(400);
    }
    if(!validation.validateUsername(req.body.username)){
      return res.send({success:false,msg:'Not valid username'}).status(400);
    }
    if(!validation.validateAge(req.body.age)){
      return res.send({success:false,msg:'Not valid age'}).status(400);
    }
     users.create({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          age: req.body.age
      }, (err, result) => {
      if(err) {
        return res.send({success:false,msg:'Server error'}).status(500);
      }
        return res.send({success:true,msg:'User created'}).status(200);
      });
    }
});

app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  if(!id){
        return res.send({success:false,msg:'Id not exist'}).status(404);
  }
  if(!(id.match(/^[0-9a-fA-F]{24}$/))){
      return res.send({success:false,msg:'Id is not valid'}).status(400);
  }
  users.findOne({
      _id: id
    }, (err, result) => {
        if(err) {
          return res.send({success:false,msg:'Server error'}).status(500);
        }
        if(!result){
            return res.send({success:false,msg:'User not found'}).status(404);
        }
        return res.send(result).status(200);
      });
    res.send();
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
          return res.send('server error').status(500);
        }
          return res.send(result);
      });
    }else{
          return res.send('empty form');
    }
});
app.listen(3000);
