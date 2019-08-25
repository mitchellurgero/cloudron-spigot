'use strict';

var path = require('path'),
    byline = require('byline');

module.exports = exports = {
    status: status,
    start: start,
    stop: stop,
    command: command,
    addLogListener: addLogListener
};

var minecraft = null;
var logLineStream = null;
var logListeners = [];

function status() {
    return { running: !!minecraft };
}

function start() {
    console.log('start minecraft server');

    var opts = { cwd: path.join(__dirname, '..') };
    if (process.env.CLOUDRON) opts.cwd = '/app/data';
    
    // This line needs to change with each version number.
    minecraft = require('child_process').spawn('java', ['-Xmx1024M', '-Xms1024M', '-jar', path.join(__dirname, '../spigot-1.14.4.jar'), 'nogui'], opts);

    logLineStream = byline(minecraft.stdout);
    logLineStream.on('data', function (line) {
        console.log(line.toString()); // also log to stdout
        logListeners.forEach(function (l) {
            l.emit('line', line.toString().split('[Server thread/INFO]:')[1]);
        });
    });

    minecraft.stderr.pipe(process.stderr);
    // minecraft.stdout.pipe(process.stdout);
    // process.stdin.pipe(minecraft.stdin);

    minecraft.on('close', function () {
        minecraft = null;
    });
}

function stop(callback) {
    console.log('stop minecraft server');

    if (!minecraft) return callback();

    minecraft.kill();
    minecraft.on('close', function () {
        minecraft = null;
        callback();
    });
}

function command(cmd, callback) {
    if (!minecraft) return;
    minecraft.stdin.write(cmd + '\n', callback);
}

function addLogListener(socket) {
    logListeners.push(socket);
}
