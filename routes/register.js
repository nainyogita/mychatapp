var express = require('express');
var userModel = require('../models/user');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("inside register get");
    res.render('register', {
        title: 'Register user'
    });
});

router.post('/', function(req, res, next) {
    console.log("inside register post");

    userModel.find({
        username: req.body.name
    }, function(err, user) {
        if (err)
            console.log('error finding');

        //console.log(user);
        if (user.length == 0) {
            var newUser = new userModel({
                username: req.body.name,
                userpass: req.body.password
            });

            newUser.save(function(err) {
                if (err) throw err;
                console.log('User saved successfully');
                //res.send('Saved successfully');
                res.render('chat', {
                    title: 'Chat web app'
                });
            });
        } else {
            console.log("user already exist");
            res.render('register', {
                title: 'Register user'
            });
        }
    });


});

module.exports = router;
