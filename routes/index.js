var express = require('express');
var router = express.Router();

var request = require('request');
var endpoint = 'http://weblm.research.microsoft.com/rest.svc/bing-body/2013-12/5/jp';

var redis = require('redis');
var cache = redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST);
if (typeof process.env.REDIS_KEY) cache.auth(process.env.REDIS_KEY);

router.get('/', function(req, res) {
  res.render('index', { title: 'Spellah' });
});

router.get('/check', function(req, res) {
  key = 'msngrams|' + req.query.q

  cache.get(key, function (err, cached) {
    if (err || !cached) {
      console.log('cache miss "' + req.query.q + '"')
      query = { u: process.env.MICROSOFT_NGRAMS_KEY, p: req.query.q, format: 'json' }
      request.get({ url: endpoint, qs: query }, function (e, r, value) {
        cache.set(key, value);
        res.format({
          json: function() {
            res.send({ jp: JSON.parse(value) });
          }
        });
      })
    } else {
      console.log('cache hit "' + req.query.q + '" => ' + cached)
      res.format({
        json: function() {
          res.send({ jp: JSON.parse(cached) });
        }
      });
    }
  });
});

module.exports = router;
