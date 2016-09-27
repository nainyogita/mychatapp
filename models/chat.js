var mongoose = require('mongoose');
var schema = mongoose.Schema({
    conversationId: String,
    user1: String,
    user2: String,
    chatHistory: [{
        sender: String,
        message: String
    }]
});

var model = mongoose.model('chat', schema);
module.exports = {
    model
}
