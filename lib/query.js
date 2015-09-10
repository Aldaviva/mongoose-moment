
module.exports = function(mongoose) {
  var moment = require('moment');

  mongoose.Query.prototype.between = function() {
    var model, query, start, end;
    var path = arguments[0];

    var type = typeof path;
    var startIndex = type == 'string' ? 1 : 0;

    start = arguments[startIndex];
    end = arguments.length > startIndex + 1 ? arguments[ startIndex + 1 ] : moment();

    if ( !moment.isMoment(start) || !moment.isMoment(end) ) {
      throw new Error("Both start and end parameters should be a moment object");
    }

    if (type !== 'string') {
      path = this._path;
    }

    query = this;

    return query.where(path).gt(start.valueOf()).lt(end.valueOf());
  };
};
