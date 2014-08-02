var express = require('express');
var router = express.Router();
var request = require('request');
var endpoint = 'http://weblm.research.microsoft.com/rest.svc/bing-body/2013-12/5/jp';

router.get('/', function(req, res) {
  res.render('index', { title: 'Spellah' });
});

router.get('/check', function(req, res) {
  query = { u: process.env.MICROSOFT_NGRAMS_KEY, p: req.query.q, format: 'json' }
  request.get({ url: endpoint, qs: query }, function (e, r, value) {
    res.format({
      json: function() {
        res.send({ jp: parseFloat(value) });
      }
    });
  })
});

module.exports = router;
