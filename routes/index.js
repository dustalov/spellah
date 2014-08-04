var express = require('express');
var router = express.Router();

var request = require('request');
var endpoint = 'http://weblm.research.microsoft.com/rest.svc/bing-body/2013-12/5/jp';

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

function mapOf(keys, values) {
  var map = {}
  for(var i in keys) map[keys[i]] = values[i]
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

  console.log([tokens, ngrams, levels])

  return levels
}

function reply(res, tokens, ngrams) {
  res.format({
    json: function() {
      res.send({ check: check(tokens, ngrams), ngrams: ngrams });
    }
  });
}

router.get('/check', function(req, res) {
  var key = 'msngrams|' + req.query.q

  var tokens = req.query.q.split(' ')
  var body = []

  for (var i = tokens.length; i > 0; i--) {
    eachCons(tokens, i, function(slice) { body.push(slice.join(' ')) })
  }

  cache.get(key, function (err, cached) {
    if (err || !cached) {
      console.log('cache miss "' + req.query.q + '"')
      var query = { u: process.env.MICROSOFT_NGRAMS_KEY, format: 'json' }

      request.post({ url: endpoint, qs: query, body: body.join("\n") }, function (e, r, value) {
        var ngrams = mapOf(body, JSON.parse(value))
        cache.set(key, value)
        reply(res, tokens, ngrams)
      })
    } else {
      console.log('cache hit "' + req.query.q + '" => ' + cached)
      var ngrams = mapOf(body, JSON.parse(cached))
      reply(res, tokens, ngrams)
    }
  });
});

router.get('/env', function(req, res) {
  res.format({
    json: function() {
      res.send(JSON.stringify(process.env))
    }
  });
})

module.exports = router;
