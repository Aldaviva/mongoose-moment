module.exports = function(mongoose){
	require('./type')(mongoose);
	require('./query')(mongoose);
	return require('./schema')(mongoose);
};

module.exports.version = require('../package').version;