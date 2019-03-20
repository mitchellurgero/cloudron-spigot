'use strict';

/* global Vue */
/* global superagent */

new Vue({
    el: '#app',
    data: {
        login: {
            username: '',
            password: ''
        },
        loginSubmitBusy: false,
        status: {},
        settings: '',
        logstream: [],
        cmd: '',
        profile: null,
        loading: false
    },
    methods: {
        onError: function (error) {
            console.log(error);
        },
        onReady: function () {
            this.refresh();
            this.loadSettings();
            this.loadLogs();
        },
        refresh: function () {
            var that = this;

            superagent.get('/api/v1/status').auth(this.login.username, this.login.password).end(function (error, result) {
                if (error) return that.onError(error);
                if (result.statusCode !== 200) return that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);

                that.status = result.body.status;

                setTimeout(that.refresh, 5000);
            });
        },
        onLogin: function () {
            var that = this;

            that.loginSubmitBusy = true;
            superagent.get('/api/v1/profile').auth(this.login.username, this.login.password).end(function (error, result) {
                that.loginSubmitBusy = false;

                if (error && error.status === 401) {
                    that.$refs.loginInput.focus();
                    that.login.username = '';
                    that.login.password = '';
                    return that.onError('Invalid username or password');
                }
                if (error) return that.onError(error);
                if (result.statusCode !== 200) return that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);

                // stash the credentials in the local storage
                window.localStorage.username = that.login.username;
                window.localStorage.password = that.login.password;

                that.profile = result.body.user;

                that.onReady();
            });
        },
        onLogout: function () {
            this.profile = null;

            // delete the credentials from the local storage
            delete window.localStorage.username;
            delete window.localStorage.password;
        },
        start: function () {
            var that = this;

            superagent.post('/api/v1/start').auth(this.login.username, this.login.password).end(function (error, result) {
                if (error) return that.onError(error);
                if (result.statusCode !== 202) return that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);
            });
        },
        stop: function () {
            var that = this;

            superagent.post('/api/v1/stop').auth(this.login.username, this.login.password).end(function (error, result) {
                if (error) return that.onError(error);
                if (result.statusCode !== 202) return that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);
            });
        },
        loadSettings: function () {
            var that = this;

            superagent.get('/api/v1/settings').auth(this.login.username, this.login.password).end(function (error, result) {
                if (error) return that.onError(error);
                if (result.statusCode !== 200) return that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);

                that.settings = result.body.settings;
            });
        },
        sendCommand: function () {
            var that = this;

            superagent.post('/api/v1/command').send({ cmd: this.cmd }).auth(this.login.username, this.login.password).end(function (error, result) {
                if (error) return that.onError(error);
                if (result.statusCode !== 202) return that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);

                that.cmd = '';
            });
        },
        loadLogs: function () {
            var that = this;

            var socket = io();
            socket.on('line', function (line) {
                that.logstream.push(line);

                Vue.nextTick(function () {
                    var elem = document.getElementsByClassName('logstream')[0];
                    elem.scrollTop = elem.scrollHeight - 100;
                });
            });
        }
    },
    mounted: function () {
        var that = this;

        that.login.username = window.localStorage.username || '';
        that.login.password = window.localStorage.password || '';

        if (!that.login.username || !that.login.password) {
            that.profile = null;
            return;
        }

        that.loading = true;

        superagent.get('/api/v1/profile').auth(that.login.username, that.login.password).end(function (error, result) {
            that.loading = false;

            if (error && error.status === 401) {
                // clear the local storage on wrong credentials
                delete window.localStorage.username;
                delete window.localStorage.password;

                that.profile = null;

                return;
            }
            if (error) return that.onError(error);
            if (result.statusCode !== 200) that.onError('Unexpected response: ' + result.statusCode + ' ' + result.text);

            that.profile = result.body.user;

            that.onReady();
        });
    }
});
