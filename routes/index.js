var express = require('express');
var router = express.Router();

var request = require('request');
var endpoint = 'https://api.projectoxford.ai/text/weblm/v1.0/calculateJointProbability?model=body';
var apikey = process.env.PROJECT_OXFORD_WEBLM_KEY;

var redis = require('redis');
var cache = {};

if (!!process.env.REDIS_DISABLED) {
  cache.get = function(key, callback) { callback(null, null) }
  cache.set = function(key, value) {}
} else {
  cache = redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST)
  if (!!process.env.REDIS_KEY) cache.auth(process.env.REDIS_KEY)

  cache.on('error', function (er) {
    console.error(er.stack)
  })
}

router.get('/', function(req, res) {
  res.render('index', { title: 'Spellah' });
});

function eachCons(a, size, callback) {
  if (a.length > size)
    for (var j = 0; j <= (a.length - size); j++) callback(a.slice(j, j + size))
  else
    callback(a)
}

function mapOf(value) {
  var map = {}
  value.results.forEach(function(pair) { map[pair.words] = pair.probability })
  return map
}

function check(tokens, ngrams) {
  var levels = new Array(tokens.length)

  // initialization & unigram check
  for (var i = 0, len = levels.length; i < len; i++) {
    levels[i] = ngrams[tokens[i]] < -10 ? 1 : 0
  }

  // bigram check
  if (levels.length > 1) {
    for (var i = 0, j = 1, len = levels.length; j < len; i++, j++) {
      var token1 = tokens[i], token2 = tokens[j]
      var joint = [token1, token2].join(' ')
      if (ngrams[token1] + ngrams[token2] > ngrams[joint]) {
        levels[i] += (ngrams[token1] < ngrams[token2]) ? 2 : 1
        levels[j] += (ngrams[token1] > ngrams[token2]) ? 2 : 1
      }
    }
  }

  return levels
}

function reply(req, res, tokens, ngrams) {
  res.format({
    json: function() {
      res.send({ id: req.query.id, check: check(tokens, ngrams), ngrams: ngrams });
    }
  });
}

router.get('/check', function(req, res) {
  var key = 'weblm|' + req.query.q

  var tokens = req.query.q.split(' ')
  var body = []

  for (var i = tokens.length; i > 0; i--) {
    eachCons(tokens, i, function(slice) { body.push(slice.join(' ')) })
  }

  cache.get(key, function (err, cached) {
    if (err || !cached) {
      console.log('cache miss "' + req.query.q + '"')
      var headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apikey
      }
      var queries = JSON.stringify({queries: body})
      request.post({ headers: headers, qs: 'model=body', url: endpoint, body: queries }, function (e, r, value) {
        var ngrams = mapOf(JSON.parse(value))
        cache.set(key, value)
        reply(req, res, tokens, ngrams)
      })
    } else {
      console.log('cache hit "' + req.query.q + '" => ' + cached)
      var ngrams = mapOf(JSON.parse(cached))
      reply(req, res, tokens, ngrams)
    }
  });
});

module.exports = router;
