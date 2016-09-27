$(function() {
    console.log('in chatmain');

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $sidenav = $('.sidenav');
    //var $sender = $('.sender');

    var list = $('#current-users');
    var usersConn = [];
    var userMe = $('.user-me');
    // Prompt for setting a username
    var username = window.location.search.replace('?', '').split('=')[1];
    var privateUser = "";
    //var sender = $sender.val();
    //console.log("html wala sender-->" + sender);
    var socketid;
    var chatRequestReply;
    var connected = false;
    var typing = false;
    var lastTypingTime;

    //var $currentInput = $usernameInput.focus();

    $sidenav.hide();

    var socket = io();

    // Sets the client's username
    (function setUsername() {
        // username = cleanInput($usernameInput.val().trim());
        // password = cleanInput($usernameInput.val().trim());

        console.log("inside set Username");
        // If the username is valid

        //$loginPage.fadeOut();
        $chatPage.show();
        $sidenav.show();
        $loginPage.off('click');
        //$currentInput = $inputMessage.focus();
        userMe.text("Hi " + username);
        //console.log(socket.id);

        // Tell the server your username
        socket.emit('add user', username);

    })();

    //Function to inflate chatbox
    function inflateChatBox(sender, username) {
        console.log("inflatechatbox--->");
        console.log(sender);
        var div = $('<div data-id="' + sender + '-' + username + '"/>');
        var textInput = $('<input type="text" data-id="' + sender + '-' + username + '"/>');
        var submit = $('<button type="button" data-id="' + sender + '-' + username + '" data-receiver="' + sender + '" class="send-message">Send</button>');
        div.append(textInput);
        div.append(submit);
        $('#chatbox').append(div);
    }


    function showOnlineUsers(ele) {
        list.empty();
        var len = ele.length;

        for (var i = 0; i < len; i++) {
            list.append('<li class="ouli">  <img src="/images/online.png" alt="User Online" height="20" width="20">    ' + ele[i].name + '</li>');
        }
    }



    function addParticipantsMessage(data) {
        var message = '';
        //console.log(data.connUsers);
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    socket.on('request sent', function(data) {
        var msg = "You have received a Chat Request from " + data.sender + ". Please reply YES to this message to accept the request.";

        console.log(data.sender + "------- request sent On");
        console.log(data.receiver+ "----- request receiver");
        //sender = data.sender;
        chatRequestMessage({
            message: msg
        });

        //Detect input from messageinput box: YES OR NO
        //Create a request accept button
        $('#chatrequests').append('<li data-username=' + data.sender + '>' + 'Request from ' + data.sender + '</li>');

    });

    //accept request when a request is clicked
    $('#chatrequests').on('click', 'li', function() {
        var sender = $(this).attr('data-username');
        console.log("sender --"+$(this).attr('data-username'));

        //Inflate chatbox for the current user
        if (sender != username) {
          console.log("infalte for current user");
          inflateChatBox(sender,username);
        }

       console.log("receiver--"+username);
       console.log("sender--"+sender);
        //Emit event to accept the request
        socket.emit('accept request', {
            receiver: username,
            sender: sender
        });
        $(this).remove();
    });

    //Make chat box when request is accepted
    socket.on('request accepted', function(sender) {
      console.log("inflate when req is accepted");
        inflateChatBox(sender, username);
    });

    $('#chatbox').on('click', '.send-message', function() {
      console.log("inside chatbox");
        var id = $(this).attr('data-id');
        console.log(username);
        console.log($(this).attr('data-receiver'));

        if (username != $(this).attr('data-receiver')) {
          console.log("inside if: value do not matches");
            $('div[data-id="' + id + '"]').append('<p>' + username + ': ' + $('input[data-id="' + id + '"]').val() + '</p>');
        }

        console.log("sender:"+ username);
        console.log("recericer"+ $(this).attr('data-receiver'));
        socket.emit('chat-message', {
            sender: username,
            receiver: $(this).attr('data-receiver'), ////////ERROR : WRONG RECEIVER VALUE
            message: $('input[data-id="' + id + '"]').val()
        });
    });

    //event when a chat message occurs
    socket.on('chat-message', function(message) {
        var id = message.sender + '-' + message.receiver;
        $('div[data-id="' + id + '"]').append('<p>' + message.sender + ': ' + message.message + '</p>');
    });

    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection

        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });

            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', {
                message: message,
                receiver: privateUser
            });
        }
    }


    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }



    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    }


    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function() {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    function chatRequestMessage(data) {
        var message = '';
        message = data.message;
        log(message);
    }

    socket.on('request answer', function(data) {
        console.log("inside request answer");
        if (data.answer == 1)
            var msg = "Your request has been accepted by" + socket.username;
        else {
            var msg = "Sorry!" + socket.username + " declined your request.";
        }

        chatRequestMessage({
            message: msg
        });

        chatRequestReply = 0;

    });



    //Mouse Events
    $('.ab').on("click", 'li', function() {
        console.log("private chat 2 with -->" + $(this).text());
        //console.log(socket.username);
        privateUser = $(this).text();

        console.log("Sender of request-->" + username);
        console.log("Receiver of request-->"+privateUser);
        console.log(socket.id);
        var msg = 'Chat request has been sent to ' + privateUser;
        //  sendChatRequestMessage();
        chatRequestMessage({
            message: msg
        });

        socket.emit('chat request', {
            receiver: privateUser,
            sender: username
        });
    });

    // Keyboard events

    $window.keydown(function(event) {
        // Auto-focus the current input when a key is typed
        // if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        //     $currentInput.focus();
        // }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {


            if (username && privateUser) {
                console.log("private chat enabled");
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else if (username) {
                console.log("broadcast chat");
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on('input', function() {
        updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login page
    // $loginPage.click(function() {
    //     $currentInput.focus();
    // });
    //
    // // Focus input when clicking on the message input's border
    // $inputMessage.click(function() {
    //     $inputMessage.focus();
    // });

    // Socket events



    // Whenever the server emits 'login', log the login message
    socket.on('login', function(data) {
        connected = true;
        socketid = data.id;
        // data.connUsers.forEach(function(ele) {
        //     console.log("On login-->" + ele.name);
        // });
        console.log("On login-->" + username);
        console.log("On login-->" + socketid);
        showOnlineUsers(data.connUsers)
            // Display the welcome message
        var message = "Welcome to Chat Web App";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function(data) {
        addChatMessage(data);
    });

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function(i) {
            return $(this).data('username') === data.username;
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }


    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function(data) {
        console.log("on user joined");
        showOnlineUsers(data.connUsers)
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function(data) {
        log(data.username + ' left');
        //  console.log(data.connUsers);
        showOnlineUsers(data.connUsers);
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function(data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function(data) {
        removeChatTyping(data);
    });
});
