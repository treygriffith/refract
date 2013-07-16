var Controller = require('../lib/Controller');

describe("Events API", function() {

	var cont = new Controller();

	it("adds a single event", function(done) {

		var evt = 'snarf';

		cont.on(evt, function() {

			assert.instanceOf(cont, Controller);
			assert.strictEqual(cont, this);

			done();
		});

		cont.emit(evt);
	});

	it("adds multiple events", function(done) {

		var evt = 'barf';

		cont.on(evt, function() {

			assert.instanceOf(cont, Controller);
			assert.strictEqual(cont, this);

		}, function() {

			assert.instanceOf(cont, Controller);
			assert.strictEqual(cont, this);

			done();
		});

		cont.emit(evt);
	});

	it("removes a single handler", function(done) {

		var evt = 'narf';

		var handlerToRemove = function() {

			assert.isTrue(false);
		};

		var handlerToKeep = function() {

			assert.strictEqual(cont, this);

			done();
		};

		cont.on(evt, handlerToRemove);

		cont.on(evt, handlerToKeep);

		cont.off(evt, handlerToRemove);

		cont.emit(evt);
	});

	it("removes multiple instances of the same handler", function(done) {

		var evt = 'larf';

		var handlerToRemove = function() {

			assert.isTrue(false);
		};

		var handlerToKeep = function() {

			assert.strictEqual(cont, this);

			done();
		};

		cont.on(evt, handlerToRemove);
		cont.on(evt, handlerToRemove);

		cont.on(evt, handlerToKeep);

		cont.off(evt, handlerToRemove);

		cont.emit(evt);
	});

	it("removes multiple handlers", function(done) {

		var evt = 'parf';

		var handlerToRemove = function() {

			assert.isTrue(false);
		};

		var handlerToRemove2 = function() {

			assert.isTrue(false);
		};

		var handlerToKeep = function() {

			assert.strictEqual(cont, this);

			done();
		};

		cont.on(evt, handlerToRemove);
		cont.on(evt, handlerToRemove2);
		cont.on(evt, handlerToKeep);

		cont.off(evt, handlerToRemove, handlerToRemove2);

		cont.emit(evt);
	});

	it("removes all handlers for an event", function(done) {

		var evtToRemove = 'harf';
		var evtToKeep = 'karf';


		var handlerToRemove = function() {

			assert.isTrue(false);
		};

		var handlerToRemove2 = function() {

			assert.isTrue(false);
		};

		var handlerToKeep = function() {

			assert.strictEqual(cont, this);

			done();
		};

		cont.on(evtToRemove, handlerToRemove);
		cont.on(evtToRemove, handlerToRemove2);
		cont.on(evtToKeep, handlerToKeep);

		cont.off(evtToRemove);

		cont.emit(evtToRemove);
		cont.emit(evtToKeep);
	});

	it("attaches a one-time handler", function() {

		var evt = 'tarf';

		var i = 0;

		cont.once(evt, function() {

			assert.strictEqual(i, 0);

			i++;
		});

		cont.emit(evt);
		cont.emit(evt);
	});

	it("passes data to handlers", function(done) {

		var evt = 'yarf';
		var myData = {
			a: "a"
		};

		cont.on(evt, function(data) {

			assert.strictEqual(myData, data);

			done();
		});

		cont.emit(evt, myData);
	});

	it("repeats events of other controllers", function(done) {

		var evt = 'varf';

		var myData = {
			a: "a"
		};

		var newCont = new Controller();

		cont.repeat(newCont, evt);

		cont.on(evt, function(data) {

			assert.strictEqual(myData, data);

			// `this` should be in the context of the controller to which the handler was applied
			assert.strictEqual(this, cont);

			done();
		});

		newCont.emit(evt, myData);
	});

	it("stops repeating other controllers' events", function(done) {

		var evt = 'jarf';
		var evt2 = 'scarf';

		var myData = {
			a: "a"
		};

		var newCont = new Controller();

		cont.repeat(newCont, evt);

		cont.on(evt, function(data) {

			assert.fail('reached handler', 'does not reach handler');

		});

		cont.on(evt2, function(data) {

			done();
		});

		cont.stopRepeating(newCont, evt);

		newCont.emit(evt, myData);
		cont.emit(evt2);

	});
});