"use strict";
var config = require(__dirname + '/config.js');

//requires
var express = require('express');
var bodyParser = require('body-parser');

//setup app
var app = express();
//use public dir for static files
app.use(express.static('public'));


//setup body parser for post bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set port
app.set('port', config.port);


//routes
app.get('/',function(req,res){
	res.sendFile(config.viewsDir + 'index.html');
});

app.get('/api/workouts',function(req,res){
	var workouts = {};
	workouts.data = [{name: 'benchpress', date: '2015-10-01', lbs:true, weight: 100, reps:10}, {name: 'squat', date: '2016-11-11', lbs:false, weight: 300, reps:2}];
	res.json(workouts);
});


//default route when nothing else matches
app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});


//start app
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});