var utils = require('../lib/utils');

describe("Class Extension", function() {

	function BaseClass(arg) {
		arg = arg || {};

		arg.baseClass = BaseClass;

		assert.isTrue(true);

		return this;
	}

	BaseClass.prototype.method1 = function(arg) {

		assert.isTrue(true);
	};

	it("creates a new class with access to the parent's prototype", function() {

			var NewClass = utils.extend(BaseClass);

			var newObj = new NewClass();

			assert.doesNotThrow(newObj.method1);

			assert.notStrictEqual(NewClass, BaseClass);
	});

	it("creates new classes that are instances of both constructors", function() {

		var NewClass = utils.extend(BaseClass);

		var newObj = new NewClass();

		assert.instanceOf(newObj, NewClass);
		assert.instanceOf(newObj, BaseClass);
	});

	it("provides access to the parent's prototype", function() {

		var NewClass = utils.extend(BaseClass);

		assert.strictEqual(NewClass.__super__, BaseClass.prototype);
	});

	it("calls both constructors", function() {

		var arg = {};
		var test = "boo";

		var NewClass = utils.extend(BaseClass, function(arg) {
			arg.newClass = test;

			return this;
		});

		var newObj = new NewClass(arg);

		assert.strictEqual(arg.newClass, test);
		assert.strictEqual(arg.baseClass, BaseClass);
	});

	it("supports extension chains", function() {

		var NewClass = utils.extend(BaseClass);

		var NewerClass = utils.extend(NewClass);

		var newObj = new NewerClass();

		assert.instanceOf(newObj, NewerClass);
		assert.instanceOf(newObj, NewClass);
		assert.instanceOf(newObj, BaseClass);
	});

	it("allows extension as a property of the parent class", function() {

		var arg = {};
		var test = "bop";

		BaseClass.extend = utils._extend();

		var NewClass = BaseClass.extend(function(arg) {
			arg.test = test;

			return this;
		});

		var newObj = new NewClass(arg);

		assert.instanceOf(newObj, NewClass);
		assert.instanceOf(newObj, BaseClass);
		assert.strictEqual(arg.test, test);
	});
});

describe("Partial Function Application", function() {

	function BaseClass(bool, bool2) {
		assert.isTrue(!bool2);

		assert.isTrue(bool);

		return this;
	}

	BaseClass.prototype.method1 = function(arg) {

		assert.isTrue(true);
	};

	BaseClass.partial = utils._partial();

	function add(x, y) {
		return x+y;
	}

	it("creates a new function", function() {

		var add1 = utils.partial(add, 1);

		assert.notStrictEqual(add1, add);

		assert.typeOf(add1, 'function');
	});

	it("uses the same value for the nth argument", function() {

		var add1 = utils.partial(add, 1);

		assert.equal(add(1, 2), add1(2));
	});

	it("creates a new class with access to the parent's prototype when used on a constructor", function() {


			var NewClass = BaseClass.partial(true);

			var newObj = new NewClass();

			assert.doesNotThrow(newObj.method1);

			assert.notStrictEqual(NewClass, BaseClass);
	});

	it("creates new classes that are instances of both constructors when used on a constructor", function() {

		var NewClass = BaseClass.partial(true);

		var newObj = new NewClass();

		assert.instanceOf(newObj, NewClass);
		assert.instanceOf(newObj, BaseClass);
	});

	it("uses the same value for the nth argument when used on a constructor", function() {

		var NewClass = BaseClass.partial(true);

		var newObj = new NewClass(false);

	});
});

describe("Object Manipulation", function() {

	it("freezes properties of an object", function() {

		var obj = {
			a: 'a',
			b: 'b'
		};

		utils.freezeProperties(obj, ['a']);

		for(var p in obj) {

			assert.notStrictEqual(p, 'a');
		}

		obj.a = 'b';

		assert.strictEqual(obj.a, 'a');

		delete obj.a;

		assert.strictEqual(obj.a, 'a');
	});

});