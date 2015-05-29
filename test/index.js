var assert   = require('assert')
var Mod      = require('../')
var Moment   = require('moment');
var mongoose = require('mongoose')

var MomentSchema;
var MongooseMoment;
var Schema   = mongoose.Schema;

describe('MongooseMoment', function(){
	before(function(){
		MomentSchema = Mod(mongoose);
		MongooseMoment = mongoose.Types.Moment;
	});

	it('has a version', function(){
		assert.equal(require('../package').version, Mod.version);
	});

	it('is a function', function(){
		assert.equal('function', typeof MomentSchema);
	});

	it('extends mongoose.Schema.Types', function(){
		assert.ok(Schema.Types.Moment);
		assert.equal(MomentSchema, Schema.Types.Moment);
	});

	it('extends mongoose.Types', function(){
		assert.ok(mongoose.Types.Moment);
	});

	/** The Moment constructor was created as an anonymous function, so Moment.name = ''. This means you must use a String to set the field type in the schema, instead of being able to use the constructor.
	 * Fixing this would require a moment.js code change.
	*/
	it('can be used in schemas', function(){
		// var s = new Schema({ m: MongooseMoment });
		// var m = s.path('m')
		// assert.ok(m instanceof mongoose.SchemaType);
		// assert.equal('function', typeof m.get);

		var s = new Schema({ m: 'Moment' });
		var m = s.path('m')
		assert.ok(m instanceof mongoose.SchemaType);
		assert.equal('function', typeof m.get);

		var s = new Schema({ m: 'moment' });
		var m = s.path('m')
		assert.ok(m instanceof mongoose.SchemaType);
		assert.equal('function', typeof m.get);

		// var s = new Schema({ m: Moment });
		// var m = s.path('m')
		// assert.ok(m instanceof mongoose.SchemaType);
		// assert.equal('function', typeof m.get);
	});

	describe('integration', function(){
		var db, S, schema, id;

		before(function(done){
			db = mongoose.createConnection('localhost', 'mongoose_moment')
			db.once('open', function () {
				schema = new Schema({
						m: 'Moment'
					, docs: [{ m: 'Moment' }]
				});
				S = db.model('MomentModel', schema);
				db.db.dropDatabase(function(){
					done();
				});
			});
		});

		after(function(done){
			db.db.dropDatabase(function () {
				db.close(done);
			});
		});

		describe('casts', function(){
			it('null', function(done){
				var s = new S({ m: null });
				assert.equal(s.m, null);
				done();
			});

			it('dates', function(done){
				var s = new S({ m: '2013-02-08' });
				assert.ok(Moment.isMoment(s.m), 'isMoment('+s.m+') = false');
				assert.ok(new Moment('2013-02-08').isSame(s.m), "correct value");
				done();
			});

			// describe('instanceof Moment', function(){
			// 	it('retains flags', function(done){
			// 		var s = new S({ reg: new RegExp('mongodb', 'img') });
			// 		assert.ok(s.reg instanceof RegExp);
			// 		assert.equal(s.reg.source, 'mongodb');
			// 		assert.ok(s.reg.ignoreCase);
			// 		assert.ok(s.reg.global);
			// 		assert.ok(s.reg.multiline);
			// 		done();
			// 	})
			// })

			// describe('RegExp literals', function(){
			// 	it('retains flags', function(done){
			// 		var s = new S({ reg: /mongodb/img });
			// 		assert.ok(s.reg instanceof RegExp);
			// 		assert.equal(s.reg.source, 'mongodb');
			// 		assert.ok(s.reg.ignoreCase);
			// 		assert.ok(s.reg.global);
			// 		assert.ok(s.reg.multiline);
			// 		done();
			// 	})
			// })

			/*it('non-castables produce _saveErrors', function(done){
				var schema = new Schema({ date: 'Moment' }, { strict: 'throw' });
				var M = db.model('throws', schema);
				var m = new M({ date: "not a real date" });
				m.save(function (err) {
					console.log( err );
					assert.ok(err, 'error expected');
					assert.equal('moment', err.type, 'wrong type');
					assert.equal('CastError', err.name, 'wrong name');
					done();
				});
			});*/
		});

		describe('with db', function(){
			var id;
			// mongoose.set('debug', true);

			it('save', function(done){

				var s = new S({
						m: new Moment("12-25-1995", "MM-DD-YYYY")
					, docs: [null, { m: new Moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123}) } ]
				});
				s.save(function (err) {
					assert.ifError(err);
					id = s.id;
					done();
				})
			});

			it('findById', function(done){
				S.findById(id, function (err, doc) {
					assert.ifError(err);
					assert.ok(Moment.isMoment(doc.m));
					assert.ok(doc.m.isSame(new Moment("12-25-1995", "MM-DD-YYYY")));
					assert.equal(null, doc.docs[0]);
					assert.ok(Moment.isMoment(doc.docs[1].m));
					assert.ok(doc.docs[1].m.isSame(new Moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123})));
					done();
				});
			});

			// it('find with RegExp literal', function(done){
			// 	S.find({ reg: /mongodb/i }, function (err, docs) {
			// 		assert.ifError(err);
			// 		assert.equal(1, docs.length);
			// 		var doc = docs[0];
			// 		assert.equal(id, doc.id);
			// 		done();
			// 	});
			// })

			it('findOne matching null', function(done){
				S.create({ m: null }, function (err, doc_) {
					assert.ifError(err);
					S.findOne({ m: null }, function (err, doc) {
						assert.ifError(err);
						assert.equal(doc.id, doc_.id, 'id mismatch');
						done();
					});
				});
			});

			it('find with instanceof Moment', function(done){
				S.find({ 'docs.m': new Moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123}).valueOf() }, function (err, docs) {
					assert.ifError(err);
					assert.equal(1, docs.length, 'expected 1 result, got '+docs.length);
					var doc = docs[0];
					assert.equal(id, doc.id, 'id mismatch');
					done();
				});
			});

			it('find with string', function(done){
				S.find({ 'docs.m': new Moment('2010-04-05T15:10:03.123').valueOf() }, function (err, docs) {
					assert.ifError(err);
					assert.equal(1, docs.length, 'expected 1 result, got '+docs.length);
					var doc = docs[0];
					assert.equal(id, doc.id);
					done();
				});
			});

			it('find with string $in', function(done){
				S.find({ 'docs.m': { $in: [new Moment('2010-04-05T15:10:03.123').valueOf(), new Moment('2010-04-06T15:10:03.123').valueOf(), new Moment('2010-04-07T15:10:03.123').valueOf()] }}, function (err, docs) {
					assert.ifError(err);
					assert.equal(1, docs.length);
					var doc = docs[0];
					assert.equal(id, doc.id);
					done();
				});
			});

			it('find with between', function(done) {
				S.where('docs.m').between(new Moment('2010-04-05'), new Moment('2010-04-07') ).exec(function(err, docs) {
					assert.ifError(err);
					assert.equal(1, docs.length);
					var doc = docs[0];
					assert.equal(id, doc.id);
					done();
				});
			});

			describe('is updateable', function(){
				it('in general', function(done){
					S.findById(id, function (err, doc) {
						assert.ifError(err);

						// doc.m = new Moment("12-25-1995", "MM-DD-YYYY");
						// assert.ok(!doc.isModified('m'));

						// doc.m = "Mon Dec 25 1995 00:00:00 GMT-0800";
						// assert.ok(!doc.isModified('m'));

						doc.m = new Moment("12-26-1995", "MM-DD-YYYY");
						doc.save(function (err) {
							assert.ifError(err);
							S.findById(id, function (err, doc) {
								assert.ifError(err);
								assert.ok(doc.m.isSame(new Moment("12-26-1995", "MM-DD-YYYY")));
								done();
							});
						});
					});
				});
			});

		});
	});
});