var sys = require('util'),
    fs = require('fs'),
    childProcess = require('child_process'),
    config = require("../config"),
    Emailer = require("../lib/emailer"),
    _ = require('underscore')._,
    Backbone = require('backbone');

var Service = function () {

    this.options = null;
    this.messages = null;

    this.init = function () {
        sys.log("Service is here to do something..");
//        if (config) {
//            this.sendMail();
//        }
    };

    this.set = function (options) {
        this.init();
        this.options = options;
    };

    this.call = function (servicename, method, id, params) {
        return this[servicename](method, id, params);
    };

    this.dataSource = function (ds) {
        this.ds = ds;
    };

    this.sendMail = function () {
        var data, emailer, options;

        options = {
            smtp: config.email.smtp,
            attachments: config.email.attachments,
            template: config.email.template,
            subject: config.email.subject,
            from: config.email.from,
            to: config.email.to
        };

        data = config.email.data;

        emailer = new Emailer(options, data);

        emailer.send(function(err, result) {
            if (err) return console.log(err);
//            console.log(result);
        });
    };

    this.saveUpload = function (file, group, callback) {
        var start = new Date();
        var filesplit = file.name.split('.');
        var filetype = filesplit[filesplit.length-1];
        fs.readFile(file.path, function (err, data) {
            var uploadPath = "uploads/" + group + '_' + start.getTime() + '.' + filetype;
            var newPath = __dirname + '/' + uploadPath;
            fs.writeFile(newPath, data, function (err) {
                var end = new Date();
                var duration = end.getTime() - start.getTime();
                var mbSize = Math.round(100*file.size/(1024*1024))/100;
                if (callback) {
                    callback({
                        mbSize: mbSize,
                        duration: duration,
                        filename: uploadPath
                    })
                }
            });
        });
    };

    // service methods

    this.hello = function (method, id, params) {
        return {msg: 'Hi there!', method: method, id: id, params: params};
    };

};

exports.Service = Service;

var exec_child_process = function (command, callbacks) {
    var child_ps;
    if (command) {
        child_ps = childProcess.exec(command, function (error, stdout, stderr) {
            if (error) {
                sys.log(error.stack);
                sys.log('Error code: '+error.code);
                sys.log('Signal received: '+error.signal);
            }
            if (stdout) {
                if (callbacks.stdout) {
                    callbacks.stdout(stdout);
                }
            }
            if (stderr) {
                if (callbacks.stderr) {
                    callbacks.stderr(stderr);
                }
            }
        });
        child_ps.on('exit', function (code) {
            if (callbacks.exit) {
                callbacks.exit(code);
            }
        });
    }
};

function dirExists (d, cb) {
    fs.stat(d, function (er, s) { cb(!er) })
}