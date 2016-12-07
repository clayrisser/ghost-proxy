var express = require('express');
var Promise = require('bluebird');
var fetch = require('node-fetch');
var _ = require('lodash');
var winston = require('winston');
var Err = require('err');
var app = express();
var bearerToken = '';

var options = {
  ghost: process.env.GPROXY_GHOST || '', // location of your ghost installation
  blog: process.env.GPROXY_BLOG || '', // location of the blog using the ghost proxy
  username: process.env.GPROXY_USERNAME || '', // ghost login username
  password: process.env.GPROXY_PASSWORD || '', // ghost login password
	clientSecret: process.env.GPROXY_CLIENT_SECRET || 'c38dcd39fb6f', // ghost login client_secret
  blacklist: process.env.GPROXY_BLACKLIST ? process.env.GPROXY_BLACKLIST.replace(' ', '').split(',') : [ // array of blacklisted endpoints
    '/users'
  ],
  port: process.env.GPROXY_PORT || 3008 // port for the ghost proxy server
};

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.listen(options.port, function() {
	_.each(options, function(option, key) {
		console.log(key + ': ' + option);
	});
});

app.get('/', function(req, res) {
  res.redirect(options.blog);
});

app.get('/:one', function(req, res) {
	return new Promise(function(resolve, reject) {
		resolve('/' + req.params.one);
	}).then(function(slug) {
		if (slug === '/favicon.ico') {
			return res.json({message: 'Rest api does not serve favicon'});
		}
		if (!isBlacklisted(slug)) {
			return ghostRequest(slug)
				.then(function(body) {
					res.json(body);
				}).catch(function(err) {
					throw err;
				});
		} else {
			throw new Err('Access denied', 403);
		}
	}).catch(function(err) {
		handleError(err, res);
	});
});

app.get('/:one/:two', function(req, res) {
	return new Promise(function(resolve, reject) {
		return '/' + req.params.one + '/' + req.params.two;
	}).then(function(slug) {
		if (!isBlacklisted(slug)) {
			return ghostRequest(slug)
				.then(function(body) {
					res.json(body);
				}).catch(function(err) {
					throw err;
				});
		} else {
			throw new Err('Access denied', 403);
		}
	}).catch(function(err) {
		handleError(err, res);
	});
});

app.get('/:one/:two/:three', function(req, res) {
	return new Promise(function(resolve, reject) {
		return '/' + req.params.one + '/' + req.params.two + '/' + req.params.three;
	}).then(function(slug) {
		if (!isBlacklisted(slug)) {
			return ghostRequest(slug)
				.then(function(body) {
					res.json(body);
				}).catch(function(err) {
					throw err;
				});
		} else {
			throw new Err('Access denied', 403);
		}
	}).catch(function(err) {
		handleError(err, res);
	});
});

function handleError(err, res) {
	if (err.code) {
    var code = Number(err.code);
		if (100 <= code && code <= 599) { // valid http response code
		  if (code >= 500) { // server error
			  winston.error(err);
			} else {
				if (process.env.NODE_ENV !== 'production') {
          winston.warn(err.message);
				}
			}
		  return res.status(err.code).json({message: err.message});
		}
	}
	// unknown error
	winston.error(err);
	return res.status(500).json({message: err.message});
}

function isBlacklisted(item) {
  for (var i = 0; i < options.blacklist.length; i++) {
    var blacklisted = options.blacklist[i];
    if (item === blacklisted) {
      return true;
    }
  }
  return false;
}

function getBearerToken() {
	return fetch(options.ghost + '/ghost/api/v0.1/authentication/token', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'password',
      username: options.username,
      password: options.password,
      client_id: 'ghost-admin',
      client_secret: options.clientSecret
    }),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(function(response) {
		if (response.status == 200) {
			return response.json();
		} else {
			throw new Err('Could not fetch token', response.status);
		}
	}).then(function(body) {
		return body.access_token;
	}).catch(function(err) {
		throw err;
	});
}

function ghostRequest(slug) {
	var url = options.ghost + '/ghost/api/v0.1' + slug;
	winston.info('requesting ' + url);
	return fetch(url, {
		headers: {
			Authorization: 'Bearer ' + this.bearerToken
		}
	}).then(function(response) {
		if (response.status == 200) {
			return response.text();
		} else if (response.status == 401) {
			return getBearerToken().then(function(token) {
				this.bearerToken = token;
				return ghostRequest(slug).then(function(body) {
					return body;
				}).catch(function(err) {
					throw err;
				});
			}).catch(function(err) {
				reject(err);
			});
		} else {
			throw new Err('Unknown error', response.status);
		}
	}).then(function(body) {
		try {
			return JSON.parse(body);
		} catch(err) {
			return body;
		}
	}).catch(function(err) {
		throw err;
	});
}
