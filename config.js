"use strict";
//configuration for app

var config = {};
config.port = 3000; //port app runs on

config.viewsDir = __dirname + '/views/';


config.db = {
	host  : 'localhost',
 	user  : 'student',
  	password: 'default',
  	database: 'student'
};



module.exports = config;