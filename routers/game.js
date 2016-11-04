const $ = require('express').Router();

$.route('/')
.get((req, res, next) => {
    res.render('home');
});

$.route('/screen')
.get((req, res, next) => {
    res.render('screen');
});

$.route('/player')
.get((req, res, next) => {
    res.render('player');
});

module.exports = $;
