var express = require('express');
var Promise = require('bluebird');
var request = require('request');
var app = express();
var bearerToken = '';

var options = {
    ghost: process.env.GPROXY_GHOST || '', // location of your ghost installation
    blog: process.env.GPROXY_BLOG || '', // location of the blog using the ghost proxy
    username: process.env.GPROXY_USERNAME || '', // ghost login username
    password: process.env.GPROXY_PASSWORD || '', // ghost login password
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

app.get('/', function(req, res) {
    res.redirect(options.blog);
});

app.get('/:one', function(req, res) {
    var slug = '/' + req.params.one;
    if (!isBlacklisted(slug)) {
        ghostRequest(slug)
        .then(function(body) {
            res.json(body);
        }).catch(function(err) {
            sendError(res, err);
        });
    } else {
        res.status(403).send('Access denied');
    }
});

app.get('/:one/:two', function(req, res) {
    var slug = '/' + req.params.one + '/' + req.params.two;
    if (!isBlacklisted(slug)) {
        ghostRequest(slug)
        .then(function(body) {
            res.json(body);
        }).catch(function(err) {
            sendError(res, err);
        });
    } else {
        res.status(403).send('Access denied');
    }
});

app.get('/:one/:two/:three', function(req, res) {
    var slug = '/' + req.params.one + '/' + req.params.two + '/' + req.params.three;
    if (!isBlacklisted(slug)) {
        ghostRequest(slug)
        .then(function(body) {
            res.json(body);
        }).catch(function(err) {
            sendError(res, err);
        });
    } else {
        res.status(403).send('Access denied');
    }
});

app.listen(options.port, function() {
    console.log('serving application');
});

function sendError(res, err) {
    if (err.statusCode) {
        if (err.body) {
            res.status(err.statusCode).send(err.body);
        } else {
            res.status(err.statusCode).send(err);
        }
    } else {
        console.log(err);
        res.status(400).send(err);
    }
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
    return new Promise(function(resolve, reject) {
        request({
            url: 'http://blog.groupthreads.com/ghost/api/v0.1/authentication/token',
            method: 'POST',
            json: true,
            body: {
                grant_type: 'password',
                username: options.username,
                password: options.password,
                client_id: 'ghost-admin',
                client_secret: 'c38dcd39fb6f'
            }
        }, function (err, res, body) {
            if (!err) {
                if (res.statusCode == 200) {
                    resolve(body.access_token);
                } else {
                    reject(res);
                }
            } else {
                reject(err);
            }
        });
    });
}

function ghostRequest(slug) {
    return new Promise(function(resolve, reject) {
        request({
            url: options.ghost + '/ghost/api/v0.1' + slug,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + bearerToken
            }
        }, function (err, res, body) {
            if (!err) {
                if (res.statusCode == 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch(err) {
                        reject({
                            statusCode: 404,
                            body: err
                        });
                    }
                } else if (res.statusCode === 401) {
                    getBearerToken().then(function(token) {
                        bearerToken = token;
                        ghostRequest(slug).then(function(body) {
                            resolve(body);
                        }).catch(function(err) {
                            reject(err);
                        });
                    }).catch(function(err) {
                        reject(false);
                    });
                } else {
                    reject(res);
                }
            } else {
                reject(err);
            }
        });
    });
}
