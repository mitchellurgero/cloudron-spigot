'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs');

var minecraft = null;

function startMinecraft() {
    console.log('start minecraft server');

    minecraft = require('child_process').spawn('java', ['-Xmx1024M', '-Xms1024M', '-jar', path.join(__dirname, 'minecraft_server.jar'), 'nogui']);

    minecraft.stdout.pipe(process.stdout);
    minecraft.stderr.pipe(process.stderr);

    minecraft.on('close', function () {
        minecraft = null;
    });
}

function stopMinecraft(callback) {
    console.log('stop minecraft server');

    if (!minecraft) return callback();

    minecraft.kill();
    minecraft.on('close', function () {
        minecraft = null;
        callback();
    });
}

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/config', function (req, res) {
    fs.readFile(path.join(__dirname, 'server.properties'), function (error, result) {
        if (error) return res.send(500, error);

        res.send(200, result);
    });
});

app.post('/config', function (req, res) {
    stopMinecraft(function () {
        fs.writeFile(path.join(__dirname, 'server.properties'), req.body.config, function (error) {
            if (error) res.send(500, error);

            startMinecraft();

            res.send(200);
        });
    });
});

app.get('/status', function (req, res) {
    res.send(200, { running: !!minecraft });
});

app.post('/start', function (req, res) {
    startMinecraft();
    res.send(200);
});

app.post('/stop', function (req, res) {
    stopMinecraft(function () {
        res.send(200);
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Configuration server listening at http://%s:%s', host, port);
});
