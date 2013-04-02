var io = require('socket.io');

var argv = require('optimist').argv,            // handles console arguments
    sys = require('util'),                      // used for system logs
	fs = require('fs'),
    db = require('dirty')('data/doxybox.db'),	// simple key value storage
    http = require('http'),
    express = require('express'),               // the application server
    journey = require('journey'),               // handles all service routes
    app = module.exports = express(),
//    http = require('http'),
    httpServer = require('http').createServer(app),
    io = io.listen(httpServer),
    services = require('./services/doxybox-services'); // handles all services

io.set('log level', 1); // disables debugging. this is optional. you may remove it if desired.

// CREATE APP AND ROUTER

var router = new(journey.Router);
var service = new(services.Service);

// DEFINE Socket.IO API

io.sockets.on('connection', function (socket) {

    socket.on('hello', function (params) { // this is used
        app.set('hello-id', params.id);
    });

});

// SET SERVER VARIABLES

app.set('env', argv.env || 'production');
app.set('static', argv.static || './static');
app.set('bin', argv.bin || './bin');
app.set('port', argv.port || 80);

service.set({
    env: app.get('env'),
    static: app.get('static'),
    port: app.get('port')
});

// SET SERVER ENVIRONMENT

app.configure(function () {
    app.set('title', 'doxybox');
    app.set('views', 'jade');
    app.set('view engine', 'jade');
});

// DEFINE MIDDLEWARE

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'doxybox' }));
//app.use(app.router);

app.use(express.static(app.get('static')));
//app.use(express.logger());

// DEFINE DATA SOURCES

service.dataSource(db);

// DEFINE JOURNEY ROUTES


router.get(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    if (params) params.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
    res.send( service.call(servicename, 'get', id, params) );
});
router.put(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    if (params) params.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
    res.send( service.call(servicename, 'put', id, params) );
});
router.del(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    if (params) params.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
    res.send( service.call(servicename, 'del', id, params) );
});
router.post(/^service\/([a-z]+)(\/){0,1}([A-Za-z0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    if (req.body) req.body.ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
    var result = service.call(servicename, 'post', id, req.body);
    if (result.location) {
        app.set('location', result.location);
    }
    res.send( result );
});

// DEFINE EXPRESS ROUTES

app.get('/index', function(req, res){
    res.render('index', { title: app.get('title') });
});

app.get('/uploads/*', function(req, res) {

        var path = __dirname + '/services/uploads/' + req.params[0];

        var filesplit = path.split('.');
        var filetype = filesplit[filesplit.length-1];
        filetype = filetype.toLowerCase();
        var contentType = '';
        if (filetype == 'jpg' || filetype == 'png') {
            contentType = 'image/'+filetype;
        } else if (filetype == 'mp4') {
            contentType = 'video/mp4';
        } else {
            contentType = 'application/octet-stream';
        }

        if (filetype == 'mp4') {
            var stat = fs.statSync(path);
            var total = stat.size;

            if (req.headers['range']) {
                var range = req.headers.range;
                var parts = range.replace(/bytes=/, "").split("-");
                var partialstart = parts[0];
                var partialend = parts[1];

                var start = parseInt(partialstart, 10);
                var end = partialend ? parseInt(partialend, 10) : total-1;
                var chunksize = (end-start)+1;
//                console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

                var file = fs.createReadStream(path, {start: start, end: end});
                res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
                file.pipe(res);
            } else {
//                console.log('ALL: ' + total);
                res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
                fs.createReadStream(path).pipe(res);
            }
        } else {
            fs.readFile(path, function (err, data) {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        }
});

app.post('/uploads', function(req, res) {
    service.saveUpload(req.files.uploadfile, 'upload', function(param) {
        res.render('uploads', { title: 'Uploads', uploadFile: param.filename, uploadStatus: 'File with ' + param.mbSize + 'MB uploaded in ' + param.duration + ' seconds' });
    });
});

// REDIRECTS

app.get('/', function(req, res){
    res.redirect('login');
});

// DIRECT TO SERVICES

app.get('/service/*', function(req, res){
    routerHandle(req, res);
});
app.put('/service/*', function(req, res){
    routerHandle(req, res);
});
app.del('/service/*', function(req, res){
    routerHandle(req, res);
});
app.post('/service/*', function(req, res){
    routerHandle(req, res);
});

// START EXPRESS SERVER LISTENING ON PORT

app.listen(app.get('port'));


sys.log("Start DOXYBOX with environment " + app.get('env') + ' on port ' + app.get('port'));

// SOME METHODS

function routerHandle (req, res) {
    router.handle(req, '', function(obj){
        if (obj.status === 404) {
            return;
        } else {
            res.writeHead(obj.status, obj.headers);
            res.end(obj.body);
        }
    });
}
