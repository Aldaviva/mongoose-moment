var util = require('util');
var Moment = require('moment');

module.exports = function(mongoose){
	var CastError = mongoose.Error.CastError;
	var SchemaTypes = mongoose.SchemaTypes;

	function MomentType(path, options){
		mongoose.SchemaType.call(this, path, options);
	}

	util.inherits(MomentType, mongoose.SchemaType);

	// allow { required: true }
	MomentType.prototype.checkRequired = function(value){
		return undefined !== value;
	};

	// cast to a function
	MomentType.prototype.cast = function(val){
		if(val instanceof Moment) return val;
		// if(!(val instanceof Date || val instanceof String || val instanceof Number)){
		// }
		var result = new Moment(val);
		if(result.isValid()){
			return result;
		} else {
			throw new CastError('Moment', val, this.path)
		}
	};

	// query casting

	function handleSingle(val){
		return this.castForQuery(val);
	}

	function handleArray(val){
		var self = this;
		return val.map(function(m){
			return self.castForQuery(m);
		});
	}

	MomentType.prototype.$conditionalHandlers = {
		'$ne'      : handleSingle,
		'$in'      : handleArray,
		'$nin'     : handleArray,
		'$gt'      : handleSingle,
		'$lt'      : handleSingle,
		'$gte'     : handleSingle,
		'$lte'     : handleSingle,
		'$all'     : handleArray,
		'$regex'   : handleSingle,
		'$options' : handleSingle
	};

	MomentType.prototype.castForQuery = function($conditional, val){
		var handler;
		if (2 === arguments.length) {
			handler = this.$conditionalHandlers[$conditional];
			if(!handler){
				throw new Error("Can't use " + $conditional + " with MomentType.");
			}
			return handler.call(this, val);
		} else {
			val = $conditional;
			return this.cast(val);
		}
	};

	/**
	 * expose
	 */

	if(SchemaTypes.Moment){
		var msg = 'A MomentType schema type is already registered.\nAre you including it twice?'
		throw new Error(msg);
	}

	SchemaTypes.Moment = MomentType;
	return MomentType;
};