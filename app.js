var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var hi = require('./routes/hi');
var chat = require('./routes/chat');
var register = require('./routes/register');
var login = require('./routes/login');

var app = express();

var http = require('http');
// var server = http.createServer(app);
// var io = require('socket.io')(server);

//server.listen(8081);

//Mongo DB connection
var MongoURI = process.env.MONGOURI || 'mongodb://localhost/test';
mongoose.connect(MongoURI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error :'));

db.once('open', function() {
    console.log('we are connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//EJS --> set for html rendering
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Logger MiddleWare Function
// var myLogger = function(req, res, next) {
//     console.log('LOGGED');
//     next(); //If next is not called, request is left hanging because the control doesnot reach the next middleware function
// };
// app.use(myLogger);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes); //routes,users are defined above

app.use('/m', routes); //2 mappings to one route

app.use('/users', users);
app.use('/login', login);

app.use('/hi', hi); //Mapping for html file

app.use('/parameters/:from-:to', routes)

app.use('/chat', chat)

app.use('/register', register)

//Serve static files (css/js)
//app.use(express.static('public'));
app.use('/static', express.static('public')); // Serves request by using /static path prefix

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//CHAT EXAMPLE

// app.get('/chatex', function(req, res) {
//     res.render('chatex', {
//         title: 'Chat getting started'
//     });
// });

// io.on('connection', function(socket) {
//     console.log('a user connected');
//     socket.broadcast.emit('hi');
//     socket.on('disconnect', function() {
//         console.log('user disconnected');
//     });
//
//     socket.on('chat message', function(msg) {
//         console.log('message: ' + msg);
//         io.emit('chat message', msg);
//     });
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

module.exports = app;
