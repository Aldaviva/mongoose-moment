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
		var s = new Schema({ m: 'Moment' });
		var m = s.path('m')
		assert.ok(m instanceof mongoose.SchemaType);
		assert.equal('function', typeof m.get);
	});

	describe('integration', function(){
		var db, S, R, N, schema, id;

		before(function(done){
			db = mongoose.createConnection('localhost', 'mongoose_moment');
			db.once('open', function () {
				db.db.dropDatabase(function(){
					done();
				});
			});
		});

		after(function(done){
			db.close(done);
		});

    it('create model', function(done){
      schema = new Schema({
          m: {type: 'Moment', default: Moment("12-25-1995", "MM-DD-YYYY")},
          docs: [{ m: 'Moment' }]
      });
      S = db.model('MomentModel', schema);
      done();
    });

    it('create model with required moment property', function(done){
      schema = new Schema({
          m: {type: 'Moment', required: true},
          docs: [{ m: 'Moment' }]
      });
      R = db.model('MomentModelRequired', schema);
      done();
    });

    it('create model with normal moment property and required moment property', function(done){
      schema = new Schema({
          n: 'Moment',
          m: {type: 'Moment', required: true},
          docs: [{ m: 'Moment' }]
      });
      N = db.model('MomentModelNormalRequired', schema);
      done();
    });

		describe('casts', function(){
            it('default', function(done){
              var s = new S({});//note no value for m is
              assert.ok(Moment.isMoment(s.m), 'isMoment('+s.m+') = false');
              assert.ok(new Moment("12-25-1995", "MM-DD-YYYY").isSame(s.m), "correct value");
              done();
            });

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

			it('milliseconds', function(done){
				var s = new S({ m: 1479168000000 });
				assert.ok(Moment.isMoment(s.m), 'isMoment('+s.m+') = false');
				assert.ok(new Moment('2016-11-15T00:00:00Z').isSame(s.m), "correct value");
				done();
			});
		});

		describe('with db', function(){
			var id, r_id, n_id;
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

      it('save instance of model with required property', function(done){

				var r = new R({
						m: new Moment("12-25-1995", "MM-DD-YYYY")
					, docs: [null, { m: new Moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123}) } ]
				});
				r.save(function (err) {
					assert.ifError(err);
					r_id = r.id;
					done();
				})
			});

      it('save instance of model with normal property and required', function(done){

				var n = new N({
          m: new Moment("12-25-1995", "MM-DD-YYYY"),
          n: new Moment("12-25-1995", "MM-DD-YYYY"),
					docs: [null, { m: new Moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123}) } ]
				});
				n.save(function (err) {
					assert.ifError(err);
					n_id = n.id;
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
        it('with required property', function(done){
					R.findById(r_id, function (err, doc) {
						assert.ifError(err);

						doc.m = new Moment("12-26-1995", "MM-DD-YYYY");
						doc.save(function (err) {
							assert.ifError(err);
							R.findById(r_id, function (err, doc) {
								assert.ifError(err);
								assert.ok(doc.m.isSame(new Moment("12-26-1995", "MM-DD-YYYY")));
								done();
							});
						});
					});
				});
        it('with normal property and required property', function(done){
					N.findById(n_id, function (err, doc) {
						assert.ifError(err);

            console.log(JSON.stringify(doc));
						doc.n = new Moment("12-26-1995", "MM-DD-YYYY");
						doc.save(function (err) {
							assert.ifError(err);
							N.findById(n_id, function (err, doc) {
								assert.ifError(err);
								assert.ok(doc.n.isSame(new Moment("12-26-1995", "MM-DD-YYYY")));
								done();
							});
						});
					});
				});
			});

		});
	});
});
