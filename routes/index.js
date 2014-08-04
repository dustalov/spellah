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
  var pairNumber = 0
  eachCons(tokens, 2, function (pair) {
    token1 = pair[0]; token2 = pair[1]; tokenJoint = pair.join(' ')
    if (ngrams[token1] + ngrams[token2] > ngrams[tokenJoint]) {
      levels[pairNumber] += (ngrams[token1] < ngrams[token2]) ? 2 : 1
      levels[pairNumber + 1] += (ngrams[token1] > ngrams[token2]) ? 2 : 1
    }
    pairNumber++
  })

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
  key = 'msngrams|' + req.query.q

  tokens = req.query.q.split(' '); body = []
  for (var i = tokens.length; i > 0; i--) {
    eachCons(tokens, i, function(slice) { body.push(slice.join(' ')) })
  }

  cache.get(key, function (err, cached) {
    if (err || !cached) {
      console.log('cache miss "' + req.query.q + '"')
      query = { u: process.env.MICROSOFT_NGRAMS_KEY, format: 'json' }

      request.post({ url: endpoint, qs: query, body: body.join("\n") }, function (e, r, value) {
        ngrams = mapOf(body, JSON.parse(value))
        cache.set(key, value)
        reply(res, tokens, ngrams)
      })
    } else {
      console.log('cache hit "' + req.query.q + '" => ' + cached)
      ngrams = mapOf(body, JSON.parse(cached))
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
