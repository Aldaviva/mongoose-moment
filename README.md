mongoose-moment
===============

Store [Moment](http://momentjs.com/docs) dates in [Mongo](http://docs.mongodb.org/manual/) using [Mongoose](http://mongoosejs.com/docs/index.html) internally as millisecond timestamps.

## Installing

	$ npm install mongoose moment mongoose-moment
	
```javascript
var mongoose = require('mongoose')
require('mongoose-moment')(mongoose);
```

## Configuration

Use the new SchemaType `'Moment'` in your schema definitions:
```javascript
var mySchema = new mongoose.Schema({
	created: 'Moment'
});
var MyModel = new mongoose.Model('MyModel', mySchema);
```

## Usage

### Writing models
```javascript
var Moment = require('moment');
var myModel = new MyModel({ created: new Moment() });
myModel.save();
```

### Reading models
```javascript
var myModel = MyModel.findById('123', function(err, doc){
	console.log(doc.created.format());
});
```

### Querying for models
Mongoose doesn't transform query values according to schemas, so you'll have to do it yourself.
Internally, Moment values are stored in the database as the number of milliseconds since the Unix epoch.
To find a document using a Moment field, use a query like
```javascript
MyModel.find({ created: new Moment('2014-03-29').valueOf() }, function(err, docs) {});
```

## Thanks

* Aaron Heckmann's [mongoose-regexp](https://github.com/aheckmann/mongoose-regexp)
