var express = require('express');
var router = express.Router();

/* Render chat view */
router.get('/', function(req, res, next) {

    console.log(req.query.username);
    res.render('chat');
});

module.exports = router;
