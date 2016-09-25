var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

//sub routes
router.get('/multiple', function(req, res, next) {
    res.render('multiple', {
        title: 'Express'
    });
});


router.get('/parameters/:from-:to', function(req, res, next) {
    res.send(req.params);
});

module.exports = router;
