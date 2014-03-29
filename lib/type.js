var Moment = require('moment');

module.exports = function(mongoose){
	mongoose.Types.Moment = Moment;
	mongoose.Types.moment = Moment;
	return mongoose.Types.Moment;
};