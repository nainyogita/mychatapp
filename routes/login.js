var express = require('express');
var userModel = require('../models/user');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("inside login get");
    res.render('login');
});

router.post('/', function(req, res, next) {
    //console.log("inside login post");
    //console.log("login post---" + req.body.username);

    userModel.find({
        username: req.body.username
    }, function(err, user) {
        if (err)
            console.log('error finding');

        console.log("login.js-->" + user);
        if (user.length != 0) {
            res.redirect('chat/?username=' + req.body.username);
        } else {
            console.log("user donot exist");
            res.redirect('register');
        }
    });

});

module.exports = router;
