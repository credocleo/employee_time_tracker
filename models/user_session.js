var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Session = new Schema({
	email: {type: String},
	date_today: {type: Date, default: Date.now},
	session_id : {type: String},
	ip_address: {type: String}
});

exports.user_session = Session;