var Model = require('../lib/Model');

describe("Model Instantiation", function() {

	it("intializes with user properties", function() {
		var myModel = new Model({
			a: "a",
			b: "b"
		});

		assert.strictEqual(myModel.a, "a");
		assert.strictEqual(myModel.b, "b");
	});

	it("only enumerates user-set properties", function() {

		var myModel = new Model({
			a: "a",
			b: "b"
		});

		assert.sameMembers(['a', 'b'], Object.keys(myModel));

	});
});

describe("Property Listening", function() {

	it("triggers a handler when the value is changed", function(done) {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			hello: kitty
		});

		assert.strictEqual(myModel.hello, kitty);

		var i = 0;

		// set up the listener
		myModel.listenTo('hello', function(hello) {

			// the first call will be with a value of 'kitty', it's initial value
			if(i > 0) {
				assert.strictEqual(this, myModel, "Called in wrong context");

				assert.equal(hello, doggy, "Subsequent change failed: Parameter wrong");

				assert.equal(myModel.hello, doggy, "Subsequent change failed: Property not set");

				done();

			} else {

				assert.strictEqual(this, myModel, "Called in wrong context");

				assert.strictEqual(hello, kitty, "Initial Binding Failed: Parameter wrong");

				assert.strictEqual(myModel.hello, kitty, "Initial Binding Failed: Property not set");
			}

			i++;
		});

		assert.strictEqual(myModel.hello, kitty);

		// change the value
		myModel.hello = doggy;
	});

	it("doesn't trigger the handler when the value remains the same", function() {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			hello: kitty
		});

		var i = 0;

		// set up the listener
		myModel.listenTo('hello', function(hello) {

			// this listener should not fire more than once for the initial binding
			if(i > 0) {
				assert.fail("called", "not called", "Listener was called unexpectedly");
			}
			i++;
		});

		// set the value to the same
		myModel.hello = kitty;
	});

	it("triggers all handlers for property", function(done) {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			hello: kitty
		});

		var fired = [];

		myModel.listenTo('hello', function(hello) {

			assert.strictEqual(this, myModel);

			fired.push(hello);

			if(fired.length === 2) {
				done();
			}
		});

		myModel.listenTo('hello', function(hello) {

			assert.strictEqual(this, myModel);

			fired.push(hello);

			if(fired.length === 2) {
				done();
			}
		});

		myModel.hello = doggy;
	});

	it("removes all listeners for a property", function() {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			hello: kitty
		});

		var i = 0;

		// set up the listener
		myModel.listenTo('hello', function(hello) {

			// this listener should not fire more than once for the initial binding
			if(i > 0) {
				assert.fail("called", "not called", "Listener was called unexpectedly");
			}
			i++;
		});

		myModel.stopListeningTo('hello');

		myModel.hello = doggy;

		assert.strictEqual(myModel.hello, doggy);
	});

	it("triggers delete events", function(done) {

		var kitty = "kitty";

		var myModel = new Model({
			hello: kitty
		});

		// set up the listener
		var listener = myModel.listenTo('hello').for('delete', function() {

			assert.strictEqual(this, myModel);

			done();
		});

		assert.strictEqual(myModel.hello, kitty);

		// delete the property
		delete myModel.hello;

		assert.strictEqual(myModel.hello, undefined);

	});

	it("triggers delete events when setting value to undefined", function(done) {

		var kitty = "kitty";

		var myModel = new Model({
			hello: kitty
		});

		// set up the listener
		var listener = myModel.listenTo('hello').for('delete', function() {

			assert.strictEqual(this, myModel);

			done();
		});

		assert.strictEqual(myModel.hello, kitty);

		// delete the property
		myModel.hello = undefined;

		assert.strictEqual(myModel.hello, undefined);

	});
});

describe("Object Property Listening", function() {

	it("triggers on changes to sub-objects", function(done) {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			pets: {
				cat: kitty,
				dog: doggy
			}
		});

		var i = 0;

		myModel.listenTo('pets', function(pets) {

			// the first call will be with a value of 'doggy', it's initial value
			if(i > 0) {

				assert.strictEqual(this, myModel);
				assert.strictEqual(pets, myModel.pets);

				assert.strictEqual(pets.dog, kitty);

				done();
			} else {

				assert.strictEqual(this, myModel);
				assert.strictEqual(pets, myModel.pets);

				assert.strictEqual(pets.dog, doggy);
			}

			i++;
		});

		myModel.pets.dog = kitty;
	});

	it("doesn't trigger when changes to sub-objects leave the object substantially the same", function(done) {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			pets: {
				cat: kitty,
				dog: doggy
			}
		});

		var i = 0;

		myModel.listenTo('pets', function(pets) {

			// listener should only be called on the inital binding
			if(i > 0) {
				assert.fail("called", "not called", "Listener was called unexpectedly");
			}

			i++;
		});

		myModel.pets.dog = doggy;

		// sub object listening is asynchronous, set a timeout to make sure we have time to catch it
		setTimeout(function() {
			done();
		}, 100);
	});

	it("provides access to an object of changes to the object", function(done) {

		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			pets: {
				cat: kitty,
				dog: doggy
			}
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets) {

			// first call will be the initial binding
			if(i > 0) {

				assert.strictEqual(changed_pets.dog, kitty);

				assert.isUndefined(changed_pets.cat);

				done();

			}

			i++;
		});

		myModel.pets.dog = kitty;

	});

	it("provides access to deleted properties", function(done) {
		var kitty = "kitty";
		var doggy = "doggy";

		var myModel = new Model({
			pets: {
				cat: kitty,
				dog: doggy
			}
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets, removed_pets) {

			// listener should only be called on the inital binding
			if(i > 0) {

				assert.strictEqual(removed_pets.dog, doggy);

				assert.isUndefined(removed_pets.cat);

				done();
			}

			i++;
		});

		delete myModel.pets.dog;
	});
});

describe("Array Listening", function() {

	it("provides access to an array of changed objects", function(done) {

		var myModel = new Model({
			pets: ['dog', 'cat']
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets) {

			if(i > 0) {

				assert.lengthOf(pets, 3);
				assert.lengthOf(changed_pets, 3);

				assert.isUndefined(changed_pets[0]);
				assert.isUndefined(changed_pets[1]);
				assert.strictEqual(changed_pets[2], 'mouse');

				assert.isArray(changed_pets);
				assert.isArray(pets);

				done();
			}

			i++;
		});

		myModel.pets.push('mouse');
	});

	it("provides access to an array of changed objects when indexes are changed", function(done) {

		var myModel = new Model({
			pets: ['dog', 'cat']
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets) {

			// listener should only be called on the inital binding
			if(i > 0) {

				assert.lengthOf(pets, 3);
				assert.lengthOf(changed_pets, 3);

				assert.strictEqual(changed_pets[0], 'mouse');
				assert.strictEqual(changed_pets[1], 'dog');
				assert.strictEqual(changed_pets[2], 'cat');

				done();
			}

			i++;
		});

		myModel.pets.unshift('mouse');
	});

	it("does not include array members that are equal in changes", function(done) {

		var myModel = new Model({
			pets: ['dog', 'cat']
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets) {

			// listener should only be called on the inital binding
			if(i > 0) {

				assert.lengthOf(pets, 3);
				assert.lengthOf(changed_pets, 3);

				assert.isUndefined(changed_pets[0]);
				assert.strictEqual(changed_pets[1], 'dog');
				assert.strictEqual(changed_pets[2], 'cat');

				done();
			}

			i++;
		});

		myModel.pets.unshift('dog');
	});

	it("provides access to deleted array members", function(done) {


		var myModel = new Model({
			pets: ['dog', 'cat']
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets, removed_pets) {

			// listener should only be called on the inital binding
			if(i > 0) {

				assert.lengthOf(pets, 2);
				assert.lengthOf(removed_pets, 1);

				assert.isUndefined(pets[0]);

				assert.strictEqual(pets[1], 'cat');

				assert.strictEqual(removed_pets[0], 'dog');

				done();
			}

			i++;
		});

		delete myModel.pets[0];
	});

	it("provides access to removed array members when spliced", function(done) {

		var myModel = new Model({
			pets: ['dog', 'cat']
		});

		var i = 0;

		myModel.listenTo('pets', function(pets, changed_pets, removed_pets) {

			if(i > 0) {

				assert.lengthOf(pets, 1);
				assert.lengthOf(removed_pets, 2);
				assert.lengthOf(changed_pets, 1);

				assert.strictEqual(pets[0], 'cat');

				assert.strictEqual(changed_pets[0], 'cat');

				assert.isUndefined(removed_pets[0]);
				assert.strictEqual(removed_pets[1], 'cat');

				done();
			}

			i++;
		});

		assert.strictEqual(myModel.pets.splice(0, 1)[0], 'dog');
	});
});

describe("Model Binding", function() {

	it("updates a single property of the bound model", function() {

		var myModel = new Model({
			name: 'Bob',
			occupation: 'Student'
		});

		var boundModel = new Model();

		myModel.bind(boundModel, 'name');

		assert.strictEqual(boundModel.name, myModel.name);
		assert.strictEqual(boundModel.name, 'Bob');

		myModel.name = 'George';

		assert.strictEqual(boundModel.name, myModel.name);
		assert.strictEqual(boundModel.name, 'George');
	});

	it("updates an array of properties on the bound model", function() {

		var myModel = new Model({
			name: 'Bob',
			occupation: 'Student'
		});

		var boundModel = new Model();

		myModel.bind(boundModel, ['name', 'occupation']);

		assert.strictEqual(boundModel.name, myModel.name);
		assert.strictEqual(boundModel.name, 'Bob');
		assert.strictEqual(boundModel.occupation, myModel.occupation);
		assert.strictEqual(boundModel.occupation, 'Student');

		myModel.name = 'George';
		myModel.occupation = 'Machinist';

		assert.strictEqual(boundModel.name, myModel.name);
		assert.strictEqual(boundModel.name, 'George');
		assert.strictEqual(boundModel.occupation, myModel.occupation);
		assert.strictEqual(boundModel.occupation, 'Machinist');
	});

	it("updates a property map on the bound model", function() {

		var myModel = new Model({
			name: 'Bob',
			occupation: 'Student'
		});

		var boundModel = new Model();

		myModel.bind(boundModel, {
			name: 'firstName',
			occupation: 'job'
		});

		assert.strictEqual(boundModel.firstName, myModel.name);
		assert.strictEqual(boundModel.firstName, 'Bob');
		assert.strictEqual(boundModel.job, myModel.occupation);
		assert.strictEqual(boundModel.job, 'Student');

		myModel.name = 'George';
		myModel.occupation = 'Machinist';

		assert.strictEqual(boundModel.firstName, myModel.name);
		assert.strictEqual(boundModel.firstName, 'George');
		assert.strictEqual(boundModel.job, myModel.occupation);
		assert.strictEqual(boundModel.job, 'Machinist');
	});

	/* Awaiting implementation
	it("stops updating a bound model when unbound", function() {

	})
	*/
});

describe("Model Housekeeping", function() {

	it("is removed from the global list when manually destroyed", function() {

		var myModel = new Model();

		assert.isTrue(Model.exists(myModel));

		myModel.destroy();

		assert.isFalse(Model.exists(myModel));
	});

	it("self-destructs when it's inactive", function(done) {

		var myModel = new Model();

		assert.isTrue(Model.exists(myModel));

		myModel.__active = false;

		// self-destruct is not immediate (it's on a 1 second timeout)
		setTimeout(function() {

			assert.isFalse(Model.exists(myModel));

			done();

		}, 1100);
	});
});