const mongoose = require('mongoose');
const HTTPStatus = {
  OK: 200,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  PARAMS_INVALID: 400
};
const Config = {
  username_minlength: 4,
  username_maxlength: 20,
  password_minlength: 6,
  password_maxlength: 24
};

module.exports.HTTPStatus = HTTPStatus;
module.exports.Config = Config;
