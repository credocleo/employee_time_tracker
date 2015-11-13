var fs = require('fs');
var jade = require('jade')
var path = require('path')
var express = require('express');
var assert = require('assert');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var connectionString = "mongodb://localhost:27017/project_x";
var urlencodedParser = bodyParser.urlencoded({extended: false});
var mongoose = require('mongoose');
var employeeModel = require('./models/employee.js');
var adminModel = require('./models/adminModel.js');

var db = mongoose.connect(connectionString);

app = express();
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');
app.use(express.static('views'));
app.use(express.static('js'));

function getDateToday(){
	var today = new Date()
	today.setHours(0,0,0,0);
	var today = today.toISOString();
	return today;
}
function getDateTimeStamp(){
	var today = new Date()
	var today = today.toISOString();
	return today;
}
function getDateTomorrow(){
	var tomorrow = new Date();
	tomorrow.setHours(23,59,59,59,999);
	var tomorrow = tomorrow.toISOString();
	
	return tomorrow;
}

app.post('/add_employee',urlencodedParser,function(req,res){
	var results = {"first_name": req.body.first_name,
			   "middle_name": req.body.middle_name,
			   "last_name": req.body.first_name,
			};
		
	var emp_model = db.model('users',employeeModel.employee);
	emp_model.find({'email': req.body.email}, function(err,result){
		if(result.length >0){
			results = {"success" : false,
					   "data" : "email already exist"};

		}
		else{
			var employee = new emp_model();

			employee.email = req.body.email;
			employee.first_name = req.body.first_name;
			employee.middle_name = req.body.middle_name;
			employee.last_name = req.body.last_name;
			employee.save();
			results = {"success": true,
					   "data": "employee registered successfully"};
		}

		res.end(JSON.stringify(results));

	});
	
});

app.post('/add_admin',urlencodedParser,function(req,res){
	var results = {"admin_password": req.body.admin_password
	};

	var admin_model = db.model('admin',adminModel.admin);
	admin_model.find({'email': req.body.admin_email}, function(err,result){
		if(result.length >0){
			results = {"success" : false,
					   "data" : "email already exist"};

		}
		else{
			var admin = new admin_model();

			admin.admin_email = req.body.admin_email;
			admin.admin_password = req.body.admin_password;
			admin.save();
			results = {"success": true,
					   "data": "admin registered successfully"};
		}

		res.end(JSON.stringify(results));

	});
	
});


app.post('/timein', urlencodedParser, function(req,res){
	console.log('timein')
	console.log(req.body.email);
	var emp_model = db.model('users', employeeModel.employee);
	emp_model.find({"email" : req.body.email, "password" : req.body.password}, function(err,result){
		if(result.length == 0){
			result = {"success": false,
					  "data": "id not found"};
			res.end(JSON.stringify(result));
		}
		else{
			var name = result;
			var emp_sheet_model = db.model('user_attendaces', employeeModel.employeeSheet);
			emp_sheet_model.find({'employee_id' : req.body.email, 'employee_password': req.body.employee_password, employee_time_in : {$gte : getDateToday(), $lt : getDateTomorrow()}},function(err,result){
							   				console.log(getDateToday());
							   				if(result.length > 0){
							   					var result = {"success": false,
							   							  "data": "already timed in"};
							   					res.end(JSON.stringify(result));
							   				}
							   				else{

												var emp_sheet = new emp_sheet_model();
												emp_sheet.employee_id = req.body.email;
												emp_sheet.save();
												console.log('saved');
							   					var result = {"success": true,
							   							  "data": name};
							   					res.end(JSON.stringify(result));
							   				}
							   			});
		}
	});
});

app.post('/timeout', urlencodedParser, function(req,res){
	console.log('timeout')
	console.log(req.body.email);
	var emp_model = db.model('users', employeeModel.employee);
	emp_model.find({"email" : req.body.email}, function(err,result){
		if(result.length == 0){
			result = {"success": false,
					  "data": "id not found"};
			res.end(JSON.stringify(result));
		}
		else{
			var emp_sheet_model = db.model('user_attendaces', employeeModel.employeeSheet);
			emp_sheet_model.find({'employee_id' : req.body.email, employee_time_out : {$gte : getDateToday(), $lt : getDateTomorrow()}, employee_time_out : null},function(err,result){
							   				if(result.length > 0){
							   					/*emp_sheet_model.update({employee_id: req.body.email},{employee_time_out : Date.now});
							   					//emp_sheet.save();
												console.log('updated');
							   					var result = {"success": true,
							   							  "data": "timed out"};

							   					res.end(JSON.stringify(result));*/
							   					var date = new Date();
												console.log(date);
												console.log(date.toISOString());
							   					emp_sheet_model.findOne({ employee_id: req.body.email, employee_time_in : {$gte : getDateToday(), $lt : getDateTomorrow()} }, function (err, doc){
  												doc.employee_time_out = getDateTimeStamp();
  												doc.save();
  												console.log('id');
  												console.log(doc.employee_id);
  												console.log(doc.employee_time_out);
  												var result = {"success": true,
							   							  "data": "timed out"};

							   					res.end(JSON.stringify(result));

												});	
							   				}
							   				else{
							   				var result = {"success": false,
							   							  "data": "already timed out"};
							   					res.end(JSON.stringify(result));
							   				}
							   			});
		}
	});
});

app.post('/emp_login', urlencodedParser, function(req,res){
	var emp_model = db.model('users', employeeModel.employee);
	emp_model.find({"email" : req.body.email, "employee_password" : req.body.employee_password}, function(err,result){
		if(result.length == 0){
			result = {"success": false,
					  "data": "Invalid Email or Password"};
			res.end(JSON.stringify(result));
		}
		else{
			var emp_sheet_model = db.model('user_attendaces', employeeModel.employeeSheet);
			emp_sheet_model.find({'employee_id' : req.body.email, employee_time_in : {$gte : getDateToday(), $lt : getDateTomorrow()}, employee_time_out : null},function(err,result){
							   				if(result.length > 0){
							   					var date = new Date();
												console.log(date);
												console.log(date.toISOString());
							   					emp_sheet_model.findOne({ employee_id: req.body.email, employee_time_in : {$gte : getDateToday(), $lt : getDateTomorrow()} }, function (err, doc){
  												doc.employee_time_out = getDateTimeStamp();
  												doc.save();
  												console.log('id');
  												console.log(doc.employee_id);
  												console.log(doc.employee_time_out);
  												var result = {"success": true,
							   							  "data": "timed out"};

							   					res.end(JSON.stringify(result));

												});	
							   				}
							   				else{
							   				var result = {"success": false,
							   							  "data": "already timed out"};
							   					res.end(JSON.stringify(result));
							   				}
							   			});
		}
	});
});

app.use('/employee/register', function(req,res){
	res.render('register_employee');
});

app.use('/admin_userapp', function(req,res){
	res.render('admin_userapp');
});

app.use('/change_pass', function(req,res){
	res.render('change_pass');
});

app.use('admin_userapp10', function(req,res){
	res.render('jann');
});

app.get('/list',function(req,res){
		var employee = db.model('users',employeeModel.employee);
		employee.find(function(err,result){
			console.log(result);
			//res.render('employee',{results:result});
			response = {"result":"success", "data": result};
			res.end(JSON.stringify(response));

		});

});

app.get('/schedule_list', function(req,res){
	var schedule_list = db.model('user_attendaces', employeeModel.employeeSheet);
	schedule_list.find().sort({employee_time_in: -1, employee_id : 1}).exec(function(err,result){
		console.log(result);
		response = {"result" : "success", "data":result};
		res.end(JSON.stringify(response));
	})

});


app.use('/', function(req,res){
	res.render('index_userapp');
});
var server = app.listen(4040,function(){
	console.log('started the server');
});


