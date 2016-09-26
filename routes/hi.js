var express = require('express');
var router = express.Router();

/* GET hi.html */
router.get('/', function(req, res, next) {
    console.log("inside hii router");

    console.log(req.query.username);
    res.render('hi');
});

module.exports = router;
xports = router;
