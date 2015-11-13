var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
	admin_email : {type: String, required: true},
	admin_password : {type: String, required: true}
});

exports.admin = adminSchema;