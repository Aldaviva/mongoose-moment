module.exports = function(mongoose){
	require('./type')(mongoose);
	return require('./schema')(mongoose);
};

module.exports.version = require('../package').version;