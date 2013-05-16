var argv = require('optimist').argv,            // handles console arguments
    sys = require('util'),                      // used for system logs
	fs = require('fs'),
    _ = require('underscore'),
    http = require('http'),
    express = require('express'),               // the application server
    journey = require('journey'),               // handles all service routes
    app = module.exports = express(),
    httpServer = http.createServer(app),
    io = require('socket.io').listen(httpServer)

//		"stylus": ">=0.32.1",
//		"node-sprite": ">=0.1.2",

var generalServiceMethods = {
	
    _doxyboxSet: function (options) {
        this.options = options;
    },

    _doxyboxCall: function (servicename, method, id, params) {
		var ret = this[servicename](method, id, params);
		if (_.isArray(ret)) {
			ret = {collection: ret};
		}
        return ret;
    }

};

var Doxybox = {

    handles: {
        config: null,
        service: null,
        static: null,
        jade: null
    },

    conf: function (key) {
        return this.handles.config[key];
    },

    config: function (config) {
        this.handles.config = config;
    },

    service: function (service) {
        this.handles.service = service;
		this.handles.service = _.extend(this.handles.service, generalServiceMethods);
    },

    static: function (static) {
        this.handles.static = static;
    },

    jade: function (jade) {
        this.handles.jade = jade;
    },

    start: function () {

        var self = this;

        io.set('log level', 1); // disables debugging. this is optional. you may remove it if desired.

        // CREATE APP AND ROUTER
        this.router = new(journey.Router);

        // DEFINE Socket.IO API

        io.sockets.on('connection', function (socket) {

            socket.on('hello', function (params) {
                app.set('hello-id', params.id);
                socket.emit('hello', params);
                socket.broadcast.emit('hello', params);
            });

        });

        // SET SERVER VARIABLES

        app.set('env', this.conf('env') || 'production');
        app.set('static', this.conf('static') || './static');
        app.set('bin', this.conf('bin') || './bin');
        app.set('port', this.conf('port') || 80);

        this.handles.service.set({
            env: app.get('env'),
            static: app.get('static'),
            port: app.get('port')
        });

        // SET SERVER ENVIRONMENT

        app.configure(function () {
            app.set('title', self.conf('title') || 'Application title');
            app.set('views', self.conf('jade') || './jade');
            app.set('view engine', 'jade');
        });

        // DEFINE MIDDLEWARE

        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        app.use(express.session({ secret: this.conf('secret') || 'doxybox' }));
        //app.use(app.router);

        app.use(express.static(app.get('static')));
        //app.use(express.logger());

        // DEFINE DATA SOURCES
//        this.handles.service.dataSource(db);

        // DEFINE JOURNEY ROUTES

        this.router.get(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
            if (params) params.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
            res.send( self.handles.service._doxyboxCall(servicename, 'get', id, params) );
        });
        this.router.put(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
            if (params) params.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
            res.send( self.handles.service._doxyboxCall(servicename, 'put', id, params) );
        });
        this.router.del(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
            if (params) params.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
            res.send( self.handles.service._doxyboxCall(servicename, 'del', id, params) );
        });
        this.router.post(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
            if (req.body) req.body.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
            res.send( self.handles.service._doxyboxCall(servicename, 'post', id, req.body) );
        });

        // DEFINE EXPRESS ROUTES

        app.get('/', function(req, res){
            res.render('index', { title: app.get('title') });
        });

        app.post('/', function(req, res) {
            res.render('index', { title: app.get('title') });
        });

        var _routes = this.conf('routes');

        for (var i=0; i<_routes.get.length; i++) {
            var _route = _routes.get[i];
            app.get(_route.route, function(req, res){
                res.render(_route.view, _route.callback(req, res));
            });
        }

        for (var i=0; i<_routes.post.length; i++) {
            var _route = _routes.post[i];
            app.post(_route.route, function(req, res){
                res.render(_route.view, _route.callback(req, res));
            });
        }

        // REDIRECTS

        for (var i=0; i<_routes.redirect.length; i++) {
            var _route = _routes.redirect[i];
            app.get(_route.route, function(req, res){
                res.redirect(_route.view);
            });
        }

//        app.get('/', function(req, res){
//            res.redirect('index');
//        });

        // DIRECT TO SERVICES

        app.get('/service/*', function(req, res){
            self.routerHandle(req, res);
        });
        app.put('/service/*', function(req, res){
            self.routerHandle(req, res);
        });
        app.del('/service/*', function(req, res){
            self.routerHandle(req, res);
        });
        app.post('/service/*', function(req, res){
            self.routerHandle(req, res);
        });

        // START EXPRESS SERVER LISTENING ON PORT

        httpServer.listen(app.get('port'));

        sys.log("Start DOXYBOX APPLICATION with environment " + app.get('env') + ' on port ' + app.get('port'));

    },
	
	routerHandle: function (req, res) {
		this.router.handle(req, '', function(obj){
			if (obj.status === 404) {
				return;
			} else {
				res.writeHead(obj.status, obj.headers);
				res.end(obj.body);
			}
		});
	}

};

module.exports = Doxybox;
