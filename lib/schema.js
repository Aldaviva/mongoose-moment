var util = require('util');

/*!
 * COPIED FROM MONGOOSE CODE BASE (lib/utils.js).
 * 
 * Shallow copies defaults into options.
 *
 * @param {Object} defaults
 * @param {Object} options
 * @return {Object} the merged object
 * @api private
 */

function assignDefaults(defaults, options) {
  var keys = Object.keys(defaults),
      i = keys.length,
      k;

  options = options || {};

  while (i--) {
    k = keys[i];
    if (!(k in options)) {
      options[k] = defaults[k];
    }
  }

  return options;
};

module.exports = function(mongoose){
	var CastError   = mongoose.Error.CastError;
	var SchemaTypes = mongoose.SchemaTypes;
	var SchemaType  = mongoose.SchemaType;
	var Moment      = require('moment');

	/**
	 * Moment SchemaType constructor.
	 *
	 * @param {String} key
	 * @param {Object} options
	 * @inherits SchemaType
	 * @api private
	 */

	function SchemaMoment(key, options) {
		SchemaType.call(this, key, options);

		this.get(function(val, self){
			if(!val){
				return val;
			} else {
				return new Moment(val);
			}
		});
	}

	/*!
	 * Inherits from SchemaType.
	 */

	 util.inherits(SchemaMoment, mongoose.SchemaType);

	/**
	 * Required validator for date
	 *
	 * @api private
	 */

	SchemaMoment.prototype.checkRequired = function (value) {
		if (value == null) { // double equal (==) is used on purpose, do NOT modify
			return false;
		}

		value = Moment.isMoment(value) ? value : new Moment(value);
		return value.isValid();
	};

	/**
	 * Casts to date
	 *
	 * @param {Object} value to cast
	 * @api private
	 */

	SchemaMoment.prototype.cast = function (value) {
		if (value === null || value === '')
			return null;

		if (Moment.isMoment(value))
			return value;

		var moment = new Moment(value);

		if(moment.isValid()){
			return moment.valueOf();
		} else {
			throw new CastError('moment', value, this.path);
		}

	};

	/*!
	 * Date Query casting.
	 *
	 * @api private
	 */

	function handleSingle (val) {
		return this.cast(val).valueOf();
	}

	function handleArray (val) {
		var self = this;
		return val.map( function (m) {
			return self.cast(m).valueOf();
		});
	}

	SchemaMoment.prototype.$conditionalHandlers = assignDefaults(SchemaType.prototype.$conditionalHandlers, {
		'$all' : handleArray,
		'$gt'  : handleSingle,
		'$gte' : handleSingle,
		'$in'  : handleArray,
		'$lt'  : handleSingle,
		'$lte' : handleSingle,
		'$ne'  : handleSingle,
		'$nin' : handleArray
	});


	/**
	 * Casts contents for queries.
	 *
	 * @param {String} $conditional
	 * @param {any} [value]
	 * @api private
	 */

	SchemaMoment.prototype.castForQuery = function ($conditional, val) {
		var handler;

		if (2 !== arguments.length) {
			return this.cast($conditional);
		}

		handler = this.$conditionalHandlers[$conditional];

		if (!handler) {
			throw new Error("Can't use " + $conditional + " with Moment.");
		}

		return handler.call(this, val);
	};

	/*!
	 * Module exports.
	 */

	if (SchemaTypes.Moment) {
		var msg = 'A Moment schema type is already registered.\nAre you including it twice?';
		throw new Error(msg);
	}
	SchemaTypes.Moment = SchemaMoment;

	return SchemaMoment;
};
