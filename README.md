Spellah
=======

Spellah is a spell checking mashup called written in Node.js and deployed on the Azure cloud. The mashup functionaly is based on n-grams' frequencies obtained from the search engines. When the phrase frequency is high, it is considered as correctly spelled. Otherwise, if the frequency is low and the phrase is potentially misspelled, the system tries to locate the mistake using additional queries for the parts of the phrase.

## API

Spellah provides an application programming interface which allows one to interact with it using HTTP. To check the spelling of a phrase, it is necessary to send the phrase to Spellah as a GET request.

```bash
curl 'http://<ENDPOINT>/check?q=remember+when+ya+were'
```

The default API format is JSON. The resulted JSON object contains two properties: `check` and `ngrams`.

```json
{"check":[0,0,2,1],"ngrams":{"remember when ya were":-12.499,"remember when ya":-9.831,"when ya were":-9.888,"remember when":-5.705,"when ya":-7.26,"ya were":-8.374,"remember":-3.896,"when":-3.004,"ya":-4.647,"were":-3.161}}
```

The first one is an array with error levels for each consequent token. In the given example the levels are `0` both for words *remember* and *when*, `2` for the word *ya*, and `1` for the word *were*. The higher is number, the more likely is the word to be misspelled. The second property represents n-grams' log-probabilities obtained from the Microsoft Web N-Gram service.

## Availability

<http://spellah.azurewebsites.net/>

## Acknowledgements

* [Dennis Gannon](http://research.microsoft.com/en-us/people/degannon/), Sergey Berezin, and the school's staff for the fruitful discussions.
* [Microsoft Web N-Gram Service](http://weblm.research.microsoft.com) team for the provided API key.
