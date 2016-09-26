var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    userpass: String
});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;
