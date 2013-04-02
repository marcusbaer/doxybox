(function() {
    require.config({
        'i18n': {
            locale: 'en-EN'
        },
        shim: {
            'jquery': {
                exports: '$'
            },
            'underscore': {
                exports: '_'
            },
            'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            }
        },
        paths: {
            'requireLib': 'libs/require/require',
            'text': 'libs/require/text',
            'i18n': 'libs/require/i18n',
            'socketio': 'libs/socketio/socket.io',
            'underscore': 'libs/underscore/underscore',
            'backbone': 'libs/backbone/backbone',
            'jquery': 'libs/jquery/jquery'
        }
    });

    define([
        'underscore',
        'backbone',
        'jquery',
        'doxybox/models',
        'doxybox/views',
        'socketio'
    ], function(
        _,
        Backbone,
        $,
        Models,
        Views
        ) {
        var Doxybox;
        return Doxybox = (function() {

            function Doxybox() {}
            var AppRouter = Backbone.Router.extend({

                routes: {
                    "":                         "start",
                    "*actions":                 "start"
                },

                initialize: function() {

                    window.app = app = {};

                    var socket = app.socket = io.connect( document.location.origin );
                    socket.on('connect', function () {
                        socket.emit('hello', {id: '123'});
                        socket.on('hello', function (data) {
                            console.log(data);
                        });
                    });

                },

                start: function() {
					// more code here in our starting route ...
                }

            });

            var app_router = new AppRouter;
            Backbone.history.start();

            Doxybox.prototype.say = function() {
                return console.log("say");
            };

            return Doxybox;

        })();
    });

}).call(this);
