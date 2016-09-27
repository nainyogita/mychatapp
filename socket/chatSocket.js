var chat = {};

var chatSchema = require('../models/chat');
var chat = chatSchema.model;

module.exports = function(io) {

        var numUsers = 0;
        var connUsers = [];

        io.on('connection', function(socket) {
            var addedUser = false;
            console.log("On connection-->" + socket.id);

            // when the client emits 'new message', this listens and executes
            socket.on('new message', function(data) {
                // we tell the client to execute 'new message'
                //console.log("hiiiiiiiii" + socket.username);
                if (data.receiver.length == 0) {
                    console.log(data.receiver.length);
                    socket.broadcast.emit('new message', {
                        username: socket.username,
                        message: data.message
                    });
                } else {
                    var pid;
                    console.log(data.receiver.length);
                    console.log("chat socket-->" + data.receiver.trim());
                    console.log("chat socket, emit new personal message");

                    console.log(connUsers);

                    connUsers.forEach(function(pdata) {
                        // console.log("inside foreach");
                        // console.log(pdata.id);
                        // console.log(pdata.name);
                        if (pdata.name == data.receiver.trim()) {
                            pid = pdata.id;
                            console.log("matched-->" + pid + pdata.name);
                        }
                    });
                    socket.broadcast.to(pid).emit('new message', {
                        username: socket.username,
                        message: data.message
                    });
                }
            });


            socket.on('request reply', function(data) {
                var answer;
                var pid;
                console.log("Request reply");
                console.log("Sender-->" + data.message);
                console.log("Sender-->" + data.sender);
                console.log("Sender-->" + data.receiver);
                connUsers.forEach(function(pdata) {
                    if (pdata.name == data.sender.trim()) {
                        pid = pdata.id;
                        console.log("matched" + pid);
                        console.log(pdata.name);
                    }
                });

                if (data.message == "YES" || "yes") {
                    console.log("Chat reply is yes");
                    answer = 1;
                } else {
                    answer = 0;
                    console.log("request is rejected");
                }

                console.log("emit se pehle pid" + pid);

                socket.broadcast.to(pid).emit('request answer', {
                    answer: answer,
                    username: socket.username
                });

                console.log('Event sent')
            });

            socket.on('chat request', function(data) {
                var pid;
                console.log("inside ON chat request");
                console.log('Chat reques SENDER--->' + data.sender);
                console.log('chat req RECEIVER-->' + data.receiver);

                connUsers.forEach(function(pdata) {
                    if (pdata.name == data.receiver.trim()) {
                        pid = pdata.id;
                    }
                });

                socket.broadcast.to(pid).emit('request sent', {
                    sender: data.sender,
                    receiver: data.receiver
                });

            });

            //Send notification that chat request have been accepted by the user
            socket.on('accept request', function(data) {
                var pid;
                console.log("REQUEST" + data);
                console.log(data.sender);
                console.log(data.receiver);
                //Emit request accepted event to the client

                connUsers.forEach(function(pdata) {
                    if (pdata.name == data.sender) {
                        pid = pdata.id;
                    }
                });

                socket.broadcast.to(pid).emit('request accepted', data.sender);

                //connUsers[find_id_by_username(request.receiver)].socket.emit('request accepted', request.sender);

                var new_chat;

                //Find previous chat between the clients
                chat.findOne({
                    conversationId: {
                        $in: [data.sender + '-' + data.receiver, data.receiver + '-' + data.sender]
                    }
                }, function(error, previousChat) {
                    if (previousChat) {
                        console.log('chat already exists');
                    } else {

                        //Create new chat if it doesn't exist
                        new_chat = new chat({
                            conversationId: data.sender + '-' + data.receiver,
                            user1: data.sender,
                            user2: data.receiver,
                        });
                        new_chat.save(function(error, data) {
                            console.log('chat saved');
                        })
                    }
                });
            });

            //Send chat message to the designated client
                    socket.on('chat-message', function(message) {
console.log("chat-message");
console.log(message.sender);
console.log(message.receiver);
console.log(message.message);
                      connUsers.forEach(function(pdata) {
                          if (pdata.name == message.receiver) {
                              pid = pdata.id;
                          }
                      });

                      socket.broadcast.to(pid).emit('chat-message',message);


                        //Find the previous chat
                        chat.findOne({
                            conversationId: {
                                $in: [message.receiver + '-' + message.sender, message.sender + '-' + message.receiver]
                            }
                        }, function(error, chat) {
                            chat.chatHistory.push({
                                sender: message.sender,
                                message: message.message
                            });

                            //Save the chat
                            chat.save(function() {
                                console.log('chat updated');
                            });
                        });
                    });


            // when the client emits 'add user', this listens and executes
            socket.on('add user', function(username) {
                if (addedUser) return;

                socket.username = username;
                // we store the username in the socket session for this client
                var socketuser = {
                    'id': socket.id,
                    'name': username
                };
                //socket.username = username;
                ++numUsers;
                connUsers.push(socketuser);
                addedUser = true;

                socket.emit('login', {
                    id: socket.id,
                    numUsers: numUsers,
                    connUsers: connUsers
                });
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: username,
                    numUsers: numUsers,
                    connUsers: connUsers
                });
            });

            // when the client emits 'typing', we broadcast it to others
            socket.on('typing', function() {
                socket.broadcast.emit('typing', {
                    username: socket.username
                });
            });

            // when the client emits 'stop typing', we broadcast it to others
            socket.on('stop typing', function() {
                socket.broadcast.emit('stop typing', {
                    username: socket.username
                });
            });

            // when the user disconnects.. perform this
            socket.on('disconnect', function() {

                if (addedUser) {

                    --numUsers;
                    var j = 0;

                    connUsers.forEach(function(data) {
                        if (data.id == socket.id) {
                            connUsers.splice(j, 1);
                        }
                        j++;
                    });

                    // echo globally that this client has left
                    socket.broadcast.emit('user left', {
                        username: socket.username,
                        numUsers: numUsers,
                        connUsers: connUsers
                    });
                }
            });
        });
      }
