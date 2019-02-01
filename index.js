#!/usr/bin/env node

'use strict';

require('supererror');

var server = require('./backend/server.js'),
    minecraft = require('./backend/minecraft.js');

const PORT = process.env.PORT || 3000;

server.start(parseInt(PORT), function (error) {
    if (error) return console.error('Failed to start server.', error);

    console.log(`Server is up and running on port ${PORT}`);

    minecraft.start();
});
