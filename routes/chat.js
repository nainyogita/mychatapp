var express = require('express');
var router = express.Router();

/* Render chat view */
router.get('/', function(req, res, next) {
    res.render('chat', {
        title: 'Chat web app'
    });
});

module.exports = router;
