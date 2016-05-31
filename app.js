"use strict";
var config = require(__dirname + '/config.js');

//setup database connection
var mysql = require('mysql');
var pool = mysql.createPool(config.db);

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

//get all the workouts
app.get('/api/workouts',function(req,res,next){
	pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%Y-%m-%d") AS date, lbs FROM workouts', function(err, rows, fields){
    	if(err){
     		next(err);
      		return;
		}
    	res.json({data: rows});
	});

});

//create new workout
app.post('/api/workouts',function(req,res,next){
	var workout = [];
	workout.push(req.body.name);
	workout.push(req.body.date);
	workout.push(req.body.reps);
	workout.push(req.body.lbs);
	workout.push(req.body.weight);

	pool.query("INSERT INTO workouts (`name`, `date`, `reps`, `lbs`, `weight`) VALUES (?,?,?,?,?)", workout, function(err, result){
    	if(err){
      		next(err);
      		return;
    	}
    	//send back workout id
    	res.json({id: result.insertId});
  });
});

//update edited workout
app.patch('/api/workouts/:id',function(req,res,next){
	var workoutId = parseInt(req.params.id);
	//make sure workoutId is number
	if(isNaN(workoutId)){
		next();
		return;
	}

	var workout = [];
	workout.push(req.body.name);
	workout.push(req.body.date);
	workout.push(req.body.reps);
	workout.push(req.body.lbs);
	workout.push(req.body.weight);
	workout.push(workoutId);

	pool.query("UPDATE workouts SET name=?, date=?, reps=?, lbs=?, weight=? WHERE id=? ",
		workout,
		function(err, result){
			if(err){
				next(err);
				return;
			}
			console.log(result);
			res.json(result);
		});
});

//delete a workout
app.delete('/api/workouts/:id',function(req,res,next){
	var workoutId = parseInt(req.params.id);
	//make sure workoutId is number
	if(isNaN(workoutId)){
		next();
		return;
	}
	pool.query("DELETE from workouts WHERE id=? ",
		[workoutId],
		function(err, result){
			if(err){
				next(err);
				return;
			}
			res.json({success: true, id: workoutId});
	});
});


//reset database tables
app.get('/reset-table',function(req,res,next){
  	pool.query("DROP TABLE IF EXISTS workouts", function(err){
    	var createString = "CREATE TABLE workouts("+
    		"id INT PRIMARY KEY AUTO_INCREMENT,"+
    		"name VARCHAR(255) NOT NULL,"+
    		"reps INT,"+
    		"weight INT,"+
    		"date DATE,"+
    		"lbs BOOLEAN)";
    	pool.query(createString, function(err){
      		res.type('text/plain');
      		res.send('Workouts table reset');
    	});
  	});
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