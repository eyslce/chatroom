var express = require('express');
var router = express.Router();
var userAccounts = require('../models/userAccounts.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    userAccounts.findOne().then(function(result){
        res.render('users',{data:result});
    });
});

module.exports = router;
