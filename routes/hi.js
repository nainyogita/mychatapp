var express = require('express');
var router = express.Router();

/* GET hi.html */
router.get('/', function(req, res, next) {
    res.render('hi', {
        title: 'HTML Rendering'
    });
});

module.exports = router;
