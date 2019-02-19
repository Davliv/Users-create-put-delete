const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validation = require('./validator');
const Settings = require('./settings');
const HTTPStatus = require('./settings');
const Config = require('./settings');
const Key = require('./key');
const Model = require('./model');
const Path =  require('path');
const multer  = require('multer');
const Userschema = require('./model');
const Constantss = require('./constants');
const users_db = mongoose.createConnection("mongodb://localhost:27017/users", { useNewUrlParser: true });
const users = users_db.model('users', Userschema);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Storage engine
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req,file,cb) => {
    console.log(file);
    cb(null,file.fieldname + "-" + Date.now() + Path.extname(file.originalname));
  }
})
//Init upload
const upload = multer({
    storage: storage,
    fileFilter: function(req,file,cb) {
    const fileType = /jpeg|jpg|gif|png/;
    const extName = fileType.test(Path.extname(file.originalname).toLowerCase());
    const mimeType = fileType.test(file.originalname);
    if (extName && mimeType) return cb(null,true);
    else cb("Must be image only");
  }
}).single('avatar');


app.post('/upload/:id',(req, res) => {
    if (!req.params.id) {
      return res.send({success:false,msg:'Id not exist'}).status(Settings.HTTPStatus.PARAMS_INVALID);
    }
    upload(req,res,(err) => {
        if (err) {
          return res.send({success:false,msg:err}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
        }
        if (!req.file) {
          return res.send({success:false,msg:'File not exist'}).status(Settings.HTTPStatus.PARAMS_INVALID);
        }
      users.findById(req.params.id, function (err, user) {
            if (err) return res.send({success:false,msg:err}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
            if (!user)  return res.send({success:false,msg:'User not found'}).status(Settings.HTTPStatus.NOT_FOUND);
            user.avatar = req.file.filename;
            user.save(function(err, doc, numbersAffected) {
                if (err) return res.send({success:false,msg:err}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
                else   return res.send({success:true,msg:'file success created'}).status(Settings.HTTPStatus.OK);
            });
          });
      });
    });



app.get('/users', (req, res) => {
  if (!req.query) return res.send('no query').status(Settings.HTTPStatus.NOT_FOUND);
    let q = req.query.q;
users.find({ $or:[ {'username': new RegExp(q,'i')}, {'email':new RegExp(q,'i')}]},
      (err, result) => {
        if (err) {
          return res.send({success:false,msg:'server error'}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
        }
          return res.send(result).status(HTTPStatus.OK);
      });
});

app.post('/users', (req, res) => {
  if (req.body.username && req.body.password && req.body.email && req.body.age) {
    if (!validation.validateEmail(req.body.email)) {
      return res.send('no email');
      return res.send({success:false,msg:'Not valid email'}).status(Settings.HTTPStatus.NOT_FOUND);
    }
    if (!validation.validatePassword(req.body.password)) {
      return res.send('no password');
      return res.send({success:false,msg:'Not valid password'}).status(Settings.HTTPStatus.NOT_FOUND);
    }
    if (!validation.validateUsername(req.body.username)) {
      return res.send('no username');
      return res.send({success:false,msg:'Not valid username'}).status(Settings.HTTPStatus.NOT_FOUND);
    }
    if (!validation.validateAge(req.body.age)) {
      return res.send('no age');
      return res.send({success:false,msg:'Not valid age'}).status(Settings.HTTPStatus.NOT_FOUND);
    }
    users.create({
          avatar: req.body.avatar,
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          age: req.body.age,
          role: req.body.role
      }, (err, result) => {
      if (err) {
        return res.send({success:false,msg:'Server error'}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
      }
        return res.send({success:true,msg:'User created'}).status(Settings.HTTPStatus.OK);
      });
    }
});



app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  if (!id) {
        return res.send({success:false,msg:'Id not exist'}).status(Settings.HTTPStatus.NOT_FOUND);
  }
  if (!(id.match(/^[0-9a-fA-F]{24}$/))) {
      return res.send({success:false,msg:'Id is not valid'}).status(Settings.HTTPStatus.NOT_FOUND);
  }
  users.findOne({
      _id: id
    }, (err, result) => {
        if (err) {
          return res.send({success:false,msg:'Server error'}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
        }
        if (!result) {
            return res.send({success:false,msg:'User not found'}).status(Settings.HTTPStatus.NOT_FOUND);
        }
        return res.send(result).status(HTTPStatus.OK);
      });
});

app.put('/users/:id',Key ,(req, res) => {
  let id = req.params.id;
  let queryObject = {};
    if (req.body.username && req.body.username.length) {
      if(!validation.validateUsername(req.body.username)) return res.send({success:false,msg:'Not valid username'}).status(Settings.HTTPStatus.NOT_FOUND);
        queryObject.username = req.body.username;
    }
    if (req.body.email && req.body.email.length) {
      if (!validation.validateEmail(req.body.email)) return res.send({success:false,msg:'Not valid email'}).status(Settings.HTTPStatus.NOT_FOUND);
      queryObject.email = req.body.email;
    }
    if (req.body.age && req.body.age.length) {
      if (!validation.validateAge(req.body.age)) return res.send({success:false,msg:'Not valid age'}).status(Settings.HTTPStatus.NOT_FOUND);
      queryObject.age = req.body.age;
    }


    if (req.body.password && req.body.password_confirmation && req.body.password.length && req.body.password === req.body.password_confirmation) {
      queryObject.password = req.body.password;
      if (!validation.validatePassword(req.body.password)) return res.send({success:false,msg:'Not valid password'}).status(Settings.HTTPStatus.NOT_FOUND);
    }
    if (Object.keys(queryObject).length) {
      users.updateOne({_id: id},queryObject, (err, result) => {
          if (err) {
            return res.send('server error').status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
          }
            return res.send(result).status(Settings.HTTPStatus.OK);
        });
          } else {
            return res.send('empty form');
      }
});
app.delete('/users/:id', (req, res) => {
    let adminID = req.params.id;
    let userToDelete = req.body.id;
    users.findOne({
      _id: adminID
    }, (err, result) => {
      if (err) return res.send('server error').status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
      if (result.role != Constantss.UserRoles.ADMIN) return res.send({success:false,msg:'No Admin'}).status(Settings.HTTPStatus.NOT_FOUND);
      users.deleteOne({_id: userToDelete}, (err,result) => {
      if (err) {
          return res.send('server error').status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
        }
        return res.send('user deleted').status(Settings.HTTPStatus.OK);
      });
    });
});
app.listen(8000);
