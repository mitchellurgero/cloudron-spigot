'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs');

var minecraft = null;
var configFilePath = path.join('/app/data/', 'server.properties');
var opsFilePath = path.join('/app/data/', 'ops.txt');

function startMinecraft() {
    console.log('start minecraft server');

    minecraft = require('child_process').spawn('java', ['-Xmx1024M', '-Xms1024M', '-jar', path.join(__dirname, 'minecraft_server.jar'), 'nogui'], { cwd: '/app/data/' });

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

app.get('/healthcheck', function (req, res) {
    res.sendStatus(200);
});

app.get('/config', function (req, res) {
    fs.readFile(configFilePath, function (error, result) {
        if (error) return res.status(500).send(error);

        res.sendStatus(200, result);
    });
});

app.post('/config', function (req, res) {
    stopMinecraft(function () {
        fs.writeFile(configFilePath, req.body.config, function (error) {
            if (error) return res.status(500).send(error);

            startMinecraft();

            res.sendStatus(200);
        });
    });
});

app.get('/ops', function (req, res) {
    fs.readFile(opsFilePath, function (error, result) {
        if (error) return res.status(500).send(error);

        res.status(200).send(result);
    });
});

app.post('/ops', function (req, res) {
    stopMinecraft(function () {
        fs.writeFile(opsFilePath, req.body.ops, function (error) {
            if (error) res.status(500).send(error);

            startMinecraft();

            res.sendStatus(200);
        });
    });
});

app.get('/status', function (req, res) {
    res.status(200).send({ running: !!minecraft });
});

app.post('/start', function (req, res) {
    startMinecraft();
    res.sendStatus(200);
});

app.post('/stop', function (req, res) {
    stopMinecraft(function () {
        res.sendStatus(200);
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Configuration server listening at http://%s:%s', host, port);
});
