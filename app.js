/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var mongoServer = new mongodb.Server('localhost', 27017);
var db = new mongodb.Db('ldrly', mongoServer, {
	safe : true
});


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

db.open(function(err, db) {
	if (err) {
		throw new Error(err);
	}
	app.get('/stats', routes.getStats(db));
	app.post('/stats', routes.saveStats(db));
	app.get('/leaderboard', routes.getLeaderboard(db));
});

var httpServer = http.createServer(app);
httpServer.listen(app.get('port'), function(c) {
	console.log('Express server listening on port ' + app.get('port'));
});
