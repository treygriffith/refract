var Collection = require('../lib/Collection');
var Model = require('../lib/Model');

describe("Mutator Methods", function() {

	it("pops", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal'
			},
			{
				name: 'cat',
				type: 'mammal'
			},
			{
				name: 'goose',
				type: 'bird'
			}
		]);

		var goose = animals.pop();

		assert.strictEqual(animals.length, 2);
		assert.strictEqual(goose.name, 'goose');

	});

	it("pushes", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal'
			},
			{
				name: 'cat',
				type: 'mammal'
			},
			{
				name: 'goose',
				type: 'bird'
			}
		]);

		var len = animals.push({
			name: 'moose'
		});

		assert.strictEqual(len, 4);
		assert.strictEqual(animals.length, 4);

		assert.strictEqual(animals[3].name, 'moose');
	});

	it("reverses", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal'
			},
			{
				name: 'cat',
				type: 'mammal'
			},
			{
				name: 'goose',
				type: 'bird'
			}
		]);

		animals.reverse();

		assert.strictEqual(animals[0].name, 'goose');
		assert.strictEqual(animals[1].name, 'cat');
		assert.strictEqual(animals[2].name, 'dog');

	});

	it("shifts", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal'
			},
			{
				name: 'cat',
				type: 'mammal'
			},
			{
				name: 'goose',
				type: 'bird'
			}
		]);

		var dog = animals.shift();

		assert.strictEqual(animals[0].name, 'cat');
		assert.strictEqual(dog.name, 'dog');
		assert.strictEqual(animals.length, 2);

	});

	it("sorts with a comparison function", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.sort(function(a, b) {
			return b.coolness - a.coolness;
		});

		assert.strictEqual(animals[0].name, 'dog');
		assert.strictEqual(animals[1].name, 'goose');
		assert.strictEqual(animals[2].name, 'cat');
	});

	it("splices", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.splice(1, 0, {
			name: 'moose',
			type: 'mammal'
		});

		assert.strictEqual(animals[1].name, 'moose');
		assert.strictEqual(animals.length, 4);
		assert.strictEqual(animals[2].name, 'cat');

		var removed = animals.splice(1, 1);

		assert.strictEqual(removed.length, 1);
		assert.strictEqual(removed[0].name, 'moose');

		assert.strictEqual(animals.length, 3);
		assert.strictEqual(animals[1].name, 'cat');

	});

	it("unshifts", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.unshift({
			name: 'moose',
			type: 'mammal'
		});

		assert.strictEqual(animals.length, 4);
		assert.strictEqual(animals[0].name, 'moose');

	});
});

describe("Accessor Methods", function() {

	it("has index properties", function() {

		var goose = new Model({
			name: 'goose',
			type: 'bird',
			coolness: 5
		});

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			}
		]);

		animals.push(goose);

		assert.strictEqual(goose, animals[2]);

		assert.strictEqual(animals[0].name, 'dog');
	});

	it("concats", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var other_animals = [
			{
				name: 'mouse',
				type: 'mammal'
			},
			{
				name: 'lizard',
				type: 'reptile'
			}
		];

		var new_set = animals.concat(other_animals);

		assert.ok(Array.isArray(new_set));

		assert.strictEqual(new_set.length, 5);

		assert.strictEqual(new_set[0].name, 'dog');
		assert.strictEqual(new_set[4].name, 'lizard');

	});

	it("joins", function() {

		var Animal = Model.extend();

		Animal.prototype.toString = function() {
			return this.name;
		};

		var animals = new Collection('animals');
		animals.Model = Animal;

		animals.push(
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		);

		var joined = animals.join();

		assert.strictEqual('dog,cat,goose', joined);

	});

	it("slices", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var animalsPartial = animals.slice(1);

		assert.strictEqual(animalsPartial.length, 2);
		assert.strictEqual(animalsPartial[0].name, 'cat');
		assert.strictEqual(animalsPartial[1], animals[2]);
		assert.strictEqual(animals.length, 3);
	});

	it("gives the index of an element", function() {

		var goose = new Model({
			name: 'goose',
			type: 'bird',
			coolness: 5
		});

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			}
		]);

		animals.push(goose);

		assert.strictEqual(animals.indexOf(goose), 2);
		assert.strictEqual(animals.indexOf({}), -1);
	});

	it("gives the last index of an element", function() {

		var goose = new Model({
			name: 'goose',
			type: 'bird',
			coolness: 5
		});

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			}
		]);

		animals.push(goose);
		animals.unshift(goose);

		assert.strictEqual(animals.indexOf(goose), 0);
		assert.strictEqual(animals.lastIndexOf(goose), 3);
		assert.strictEqual(animals.lastIndexOf({}), -1);
	});
});

describe("Iteration Methods", function() {

	it("runs a forEach loop", function() {

		var animals = new Collection();

		animals.push(
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		);

		animals.forEach(function(animal, i) {

			assert.ok(animal instanceof Model);

			switch (i) {
				case 0:
					assert.strictEqual(animal.name, 'dog');
				break;

				case 1:
					assert.strictEqual(animal.name, 'cat');
				break;

				case 2:
					assert.strictEqual(animal.name, 'goose');
				break;

				default:

				assert.fail("unreachable", "reachable");
			}
		});

	});

	it("every's", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			}
		]);

		assert.ok(animals.every(function(animal) {
			return animal.type === 'mammal';
		}));

		animals.push({
			name: 'goose',
			type: 'bird'
		});

		assert.notOk(animals.every(function(animal) {
			return animal.type === 'mammal';
		}));
	});

	it("some's", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		assert.ok(animals.some(function(animal) {
			return animal.type === 'bird';
		}));

		assert.ok(animals.some(function(animal) {
			return animal.type === 'mammal';
		}));

		assert.notOk(animals.some(function(animal) {
			return animal.type === 'reptile';
		}));
	});

	it("filters", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var cool_animals = animals.filter(function(animal) {

			return animal.coolness >= 5;
		});

		assert.strictEqual(cool_animals.length, 2);

	});

	it("maps", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var names = animals.map(function(animal) {
			return animal.name;
		});

		assert.strictEqual(names.length, 3);
		assert.strictEqual(names[0], 'dog');
		assert.strictEqual(names[2], 'goose');

	});

	it("reduces", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var total_coolness = animals.reduce(function(prev, animal) {
			return prev + animal.coolness;
		}, 0);

		assert.strictEqual(total_coolness, 17);

	});

	it("reduces right", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var i = 0;

		var total_coolness = animals.reduceRight(function(prev, animal) {


			switch(i) {
				case 0:
					assert.strictEqual(animal.name, 'goose');
				break;

				case 1:
					assert.strictEqual(animal.name, 'cat');
				break;

				case 2:
					assert.strictEqual(animal.name, 'dog');
				break;
			}

			i++;

			return prev + animal.coolness;
		}, 0);

		assert.strictEqual(total_coolness, 17);
	});
});

describe("Events", function() {

	it("applies events to every child model", function(done) {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.on('bark', function(sound) {
			assert.strictEqual(sound, 'ruff!');

			done();
		});

		animals[0].emit('bark', 'ruff!');
	});

	it("removes events from child models", function(done) {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.on('bark', function(sound) {

			assert.fail("unreachable", "reachable");
		});

		animals.off('bark');

		animals[1].emit('bark', 'ruff!');

		done();
	});

	it("applies events to every child model once", function(done) {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var i = 0;

		animals.once('bark', function(sound) {

			if(i > 0) {
				assert.fail("unreachable", "reachable");
			}

			assert.strictEqual(sound, 'ruff!');
		});

		animals[2].emit('bark', 'ruff!');
		animals[2].emit('bark', 'ruff!');

		done();
	});

	it("applies events to newly added models", function(done) {

		var goose = new Model({
			name: 'goose',
			type: 'bird',
			coolness: 5
		});

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			}
		]);

		animals.on('bark', function(sound) {

			assert.strictEqual(this, goose);
			assert.strictEqual(sound, 'quack!');

			done();
		});

		animals.push(goose);

		goose.emit('bark', 'quack!');

	});

	it("removes events from removed models", function(done) {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.on('bark', function(sound) {

			assert.fail("unreachable", "reachable");
		});

		var goose = animals.pop();

		goose.emit('bark', 'quack!');

		done();

	});
});

describe("Custom Methods", function() {

	it("empties the array", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		animals.empty();

		assert.strictEqual(animals.length, 0);
		assert.strictEqual(animals[0], undefined);

	});

	it("replaces the array", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		]);

		var other_animals = [
			{
				name: 'mouse',
				type: 'mammal'
			},
			{
				name: 'lizard',
				type: 'reptile'
			}
		];

		animals.replace(other_animals);

		assert.strictEqual(animals.length, 2);
		assert.strictEqual(animals[0].name, 'mouse');

	});

	it("uses a custom comparison function when using indexOf", function() {

		var animals = new Collection('animals', [
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		], function(a, b) {
			return a.name === b.name;
		});

		assert.strictEqual(animals.indexOf({name: 'dog'}), 0);
		assert.strictEqual(animals.indexOf({name: 'goose'}), 2);
		assert.strictEqual(animals.indexOf({name: 'mouse'}), -1);

	});

	it("uses a custom Model to create models", function() {

		var Animal = Model.extend();

		Animal.prototype.bark = function() {
			return 'ruff!';
		};

		var animals = new Collection('animals');
		animals.Model = Animal;

		animals.push(
			{
				name: 'dog',
				type: 'mammal',
				coolness: 10
			},
			{
				name: 'cat',
				type: 'mammal',
				coolness: 2
			},
			{
				name: 'goose',
				type: 'bird',
				coolness: 5
			}
		);

		assert.ok(animals[0] instanceof Animal);
		assert.strictEqual(typeof animals[2].bark, 'function');
		assert.strictEqual(animals[1].bark(), 'ruff!');
	});

});