'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    ldapjs = require('ldapjs'),
    basicAuth = require('basic-auth'),
    minecraft = require('./minecraft.js'),
    lastMile = require('connect-lastmile'),
    HttpError = lastMile.HttpError,
    HttpSuccess = lastMile.HttpSuccess;

module.exports = exports = {
    healthcheck: healthcheck,
    status: status,
    auth: auth,
    profile: profile,

    settings: {
        get: settingsGet,
        set: settingsSet
    },

    start: start,
    stop: stop,
    command: command
};

const LDAP_URL = process.env.CLOUDRON_LDAP_URL;
const LDAP_USERS_BASE_DN = process.env.CLOUDRON_LDAP_USERS_BASE_DN;
const LOCAL_AUTH_FILE = path.resolve('users.json');

const baseDir = process.env.CLOUDRON ? '/app/data' : path.join(__dirname, '..')
const configFilePath = path.join(baseDir, 'server.properties');

var users = {};

var AUTH_METHOD = (LDAP_URL && LDAP_USERS_BASE_DN) ? 'ldap' : 'local';
if (AUTH_METHOD === 'ldap') {
    console.log('Use ldap auth');
} else {
    console.log(`Use local auth file ${LOCAL_AUTH_FILE}`);

    try {
        users = JSON.parse(fs.readFileSync(LOCAL_AUTH_FILE, 'utf8'));
    } catch (e) {
        let template = [{ username: 'username', email: 'test@example.com', password: 'password' }];
        console.log(`Unable to read local auth file. Create a JSON file at ${LOCAL_AUTH_FILE} with\n%s`, JSON.stringify(template, null, 4));

        process.exit(1);
    }
}

function healthcheck(req, res, next) {
    next(new HttpSuccess(200, {}));
}

function status(req, res, next) {
    next(new HttpSuccess(200, { status: minecraft.status() }));
}

function auth(req, res, next) {
    var credentials = basicAuth(req);

    if (!credentials) return next(new HttpError(400, 'Basic auth required'));

    function attachUser(user) {
        req.user = user;
        return next();
    }

    if (AUTH_METHOD === 'ldap') {
        var ldapClient = ldapjs.createClient({ url: LDAP_URL });
        ldapClient.on('error', function (error) {
            console.error('LDAP error', error);
        });

        ldapClient.bind(process.env.CLOUDRON_LDAP_BIND_DN, process.env.CLOUDRON_LDAP_BIND_PASSWORD, function (error) {
            if (error) return next(new HttpError(500, error));

            var filter = `(|(uid=${credentials.name})(mail=${credentials.name})(username=${credentials.name})(sAMAccountName=${credentials.name}))`;
            ldapClient.search(process.env.CLOUDRON_LDAP_USERS_BASE_DN, { filter: filter }, function (error, result) {
                if (error) return next(new HttpError(500, error));

                var items = [];

                result.on('searchEntry', function(entry) { items.push(entry.object); });
                result.on('error', function (error) { next(new HttpError(500, error)); });
                result.on('end', function (result) {
                    if (result.status !== 0) return next(new HttpError(500, error));
                    if (items.length === 0) return next(new HttpError(401, 'Invalid credentials'));

                    // pick the first found
                    var user = items[0];

                    ldapClient.bind(user.dn, credentials.pass, function (error) {
                        if (error) return next(new HttpError(401, 'Invalid credentials'));

                        attachUser({ username: user.username, email: user.mail });
                    });
                });
            });
        });
    } else {
        let user = users.find(function (u) { return (u.username === credentials.name || u.email === credentials.name) && u.password === credentials.pass; });
        if (!user) return next(new HttpError(401, 'Invalid credentials'));

        attachUser(user);
    }
}

function profile(req, res, next) {
    assert.strictEqual(typeof req.user, 'object');

    next(new HttpSuccess(200, { user: req.user }));
}

function settingsGet(req, res, next) {
    assert.strictEqual(typeof req.user, 'object');

    fs.readFile(configFilePath, function (error, result) {
        if (error) return res.status(500).send(error);

        next(new HttpSuccess(200, { settings: result.toString() }));
    });
}

function settingsSet(req, res, next) {
    assert.strictEqual(typeof req.user, 'object');

    fs.writeFile(configFilePath, req.body.settings, function (error) {
        if (error) return res.status(500).send(error);

        next(new HttpSuccess(202, {}));
    });
}

function start(req, res, next) {
    minecraft.start();

    next(new HttpSuccess(202, {}));
}

function stop(req, res, next) {
    minecraft.stop(function () {
        next(new HttpSuccess(202, {}));
    });
}

function command(req, res, next) {
    minecraft.command(req.body.cmd, function (error) {
        if (error) return next(new HttpError(500, 'server not running'));

        next(new HttpSuccess(202, {}));
    });
}
