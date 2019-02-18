const mongoose = require('mongoose');
const Keys = require('./model');
const Settings = require('./settings');
const Userschema = require('./model');
const users_db = mongoose.createConnection("mongodb://localhost:27017/users", { useNewUrlParser: true });
const users = users_db.model('users', Userschema);

 let Key = async function(req, res, next) {
  if (req.body.key) {
      let id = req.params.id;
      try {
          let user = await users.findOne({ _id: id }).exec();
          if (user.key != req.body.key) return res.send({success:false,msg:'Dont have valid key'}).status(Settings.HTTPStatus.NOT_FOUND);
          next();
      } catch(err) {
          console.log('error caught');
          console.log(err);
      }
  } else{
    return res.send({success:false,msg:'NO key'}).status(Settings.HTTPStatus.NOT_FOUND);
  }

};

module.exports = Key;
