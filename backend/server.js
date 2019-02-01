'use strict';

var assert = require('assert'),
    connectTimeout = require('connect-timeout'),
    lastMile = require('connect-lastmile'),
    routes = require('./routes.js'),
    minecraft = require('./minecraft.js'),
    express = require('express');

module.exports = exports = {
    start: start
};

function start(port, callback) {
    assert.strictEqual(typeof port, 'number');
    assert.strictEqual(typeof callback, 'function');

    var router = express.Router();
    router.del = router.delete;

    var app = express();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    router.get ('/api/v1/healthcheck', routes.healthcheck);
    router.get ('/api/v1/status', routes.auth, routes.status);
    router.get ('/api/v1/profile', routes.auth, routes.profile);
    router.post('/api/v1/start', routes.auth, routes.start);
    router.post('/api/v1/stop', routes.auth, routes.stop);
    router.post('/api/v1/command', routes.auth, routes.command);
    router.get ('/api/v1/settings', routes.auth, routes.settings.get);
    router.post('/api/v1/settings', routes.auth, routes.settings.set);

    // for log lines
    io.on('connection', function (socket) {
        socket.on('cmd', function (cmd) {
            minecraft.cmd(cmd);
        });
        minecraft.addLogListener(socket);
    });

    app
        .use(connectTimeout(10000, { respond: true }))
        .use(express.json())
        .use(express.urlencoded({ extended: true }))
        .use(router)
        .use(express.static('./frontend'))
        .use(lastMile());

    http.listen(port, callback);
}
