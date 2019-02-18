const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validation = require('./validator');
const Settings = require('./settings');
const Model = require('./model');
const Path =  require('path');
const multer  = require('multer');
const Userschema = require('./model');
const users_db = mongoose.createConnection("mongodb://localhost:27017/users", { useNewUrlParser: true });
const users = users_db.model('users', Userschema);
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Storage engine
const storage = multer.diskStorage({
  destination:'./uploads',
  filename:(req,file,cb)=>{
    console.log(file);
    cb(null,file.fieldname + "-" + Date.now() + Path.extname(file.originalname));
  }
})
//Init upload
const upload =multer({
  storage:storage,
  fileFilter:function(req,file,cb){
    const fileType = /jpeg|jpg|gif|png/;
    const extName =fileType.test( Path.extname(file.originalname).toLowerCase());
    const mimeType = fileType.test(file.originalname);
    if(extName && mimeType) return cb(null,true);
    else cb("Must be image only");
  }
}).single('avatar');


app.post('/upload/:id',(req, res) => {
    if (!req.params.id) {
      return res.send({success:false,msg:'Id not exist'}).status(Settings.HTTPStatus.PARAMS_INVALID);
    }
    upload(req,res,(err)=> {
        if(err){
          return res.send({success:false,msg:err}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
        }
        if(!req.file) {
          return res.send({success:false,msg:'File not exist'}).status(Settings.HTTPStatus.PARAMS_INVALID);
        }
          Model.Users.findById(req.params.id, function (err, user) {
            if (err) return res.send({success:false,msg:err}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
            if( !user)  return res.send({success:false,msg:'User not found'}).status(Settings.HTTPStatus.NOT_FOUND);
            user.avatar = req.file.filename;
            user.save(function(err, doc, numbersAffected) {
                if(err) return res.send({success:false,msg:err}).status(Settings.HTTPStatus.INTERNAL_SERVER_ERROR);
                else   return res.send({success:true,msg:'file success created'}).status(Settings.HTTPStatus.OK);
            });
          });
      });
    });



app.get('/users', (req, res) => {
  if (!req.query) return res.send('no query').status(Settings.HTTPStatus.NOT_FOUND);
    let q = req.query.q;
    Model.Users.find({ $or:[ {'username': new RegExp(q,'i')}, {'email':new RegExp(q,'i')}]},
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
      return res.send({success:false,msg:'Not valid email'}).status(HTTPStatus.NOT_FOUND);
    }
    if (!validation.validatePassword(req.body.password)) {
      return res.send('no password');
      return res.send({success:false,msg:'Not valid password'}).status(HTTPStatus.NOT_FOUND);
    }
    if (!validation.validateUsername(req.body.username)) {
      return res.send('no username');
      return res.send({success:false,msg:'Not valid username'}).status(HTTPStatus.NOT_FOUND);
    }
    if (!validation.validateAge(req.body.age)) {
      return res.send('no age');
      return res.send({success:false,msg:'Not valid age'}).status(HTTPStatus.NOT_FOUND);
    }
    users.create({
          avatar: req.body.avatar,
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          age: req.body.age
      }, (err, result) => {
      if (err) {
        return res.send({success:false,msg:'Server error'}).status(HTTPStatus.INTERNAL_SERVER_ERROR);
      }
        return res.send({success:true,msg:'User created'}).status(HTTPStatus.OK);
      });
    }
});



app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  if (!id) {
        return res.send({success:false,msg:'Id not exist'}).status(HTTPStatus.NOT_FOUND);
  }
  if (!(id.match(/^[0-9a-fA-F]{24}$/))) {
      return res.send({success:false,msg:'Id is not valid'}).status(HTTPStatus.NOT_FOUND);
  }
  users.findOne({
      _id: id
    }, (err, result) => {
        if (err) {
          return res.send({success:false,msg:'Server error'}).status(HTTPStatus.INTERNAL_SERVER_ERROR);
        }
        if (!result) {
            return res.send({success:false,msg:'User not found'}).status(HTTPStatus.NOT_FOUND);
        }
        return res.send(result).status(HTTPStatus.OK);
      });
});

let userMustHaveKey = async function(req, res, next) {
  if (req.body.key) {
      let id = req.params.id;
      try {
          let user = await users.findOne({ _id: id }).exec();
          if(user.key != req.body.key)  return res.send({success:false,msg:'Dont have valid key'}).status(HTTPStatus.NOT_FOUND);
          next();
      } catch(err) {
          console.log('error caught');
          console.log(err);
      }
  } else{
    return res.send({success:false,msg:'NO key'}).status(HTTPStatus.NOT_FOUND);
  }

};

app.put('/users/:id',userMustHaveKey ,(req, res) => {
  let id = req.params.id;
  let queryObject = {};
    if (req.body.username && req.body.username.length) {
      if(!validation.validateUsername(req.body.username)) return res.send({success:false,msg:'Not valid username'}).status(HTTPStatus.NOT_FOUND);
        queryObject.username = req.body.username;
    }
    if (req.body.email && req.body.email.length) {
      if (!validation.validateEmail(req.body.email)) return res.send({success:false,msg:'Not valid email'}).status(HTTPStatus.NOT_FOUND);
      queryObject.email = req.body.email;
    }
    if (req.body.age && req.body.age.length) {
      if (!validation.validateAge(req.body.age)) return res.send({success:false,msg:'Not valid age'}).status(HTTPStatus.NOT_FOUND);
      queryObject.age = req.body.age;
    }


    if (req.body.password && req.body.password_confirmation && req.body.password.length && req.body.password === req.body.password_confirmation) {
      queryObject.password = req.body.password;
      if (!validation.validatePassword(req.body.password)) return res.send({success:false,msg:'Not valid password'}).status(HTTPStatus.NOT_FOUND);
    }
    console.log(queryObject);
    if (Object.keys(queryObject).length) {
      users.updateOne({_id: id},queryObject, (err, result) => {
          if (err) {
            return res.send('server error').status(HTTPStatus.INTERNAL_SERVER_ERROR);
          }
            return res.send(result).status(HTTPStatus.OK);
        });
          } else {
            return res.send('empty form');
      }
});
app.listen(8000);
