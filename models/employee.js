var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Employee = new Schema({
	email: {type: String, required: true}
,	first_name: {type: String, default:'user'}
,	middle_name: {type: String, default:'user'}
,	last_name: {type: String, default:'user'}
,	employee_password: {type: String, default: 'drumbi!'}
,	status: {type: Number, default: 1}

});


var EmployeeSheet = new Schema({
	employee_id: {type: String}
,	employee_password: {type: String}
,	employee_time_in: {type: Date, default: Date.now}
,	employee_time_out: {type: Date, default: ''}
,	hoursRendered : {type: Number, default: 0}
});

exports.employee = Employee;
exports.employeeSheet = EmployeeSheet;