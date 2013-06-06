exports.extend = function(Klass, Constructor) {

	var NewClass = function() {

		Klass.apply(this, [].slice.call(arguments));

		Constructor.apply(this, [].slice.call(arguments));

		return this;
	};

	NewClass.__super__ = Klass.prototype;

	NewClass.prototype = Object.create(Klass.prototype);

	NewClass.extend = exports._extend();
	NewClass.partial = exports._partial();

	return NewClass;
};

exports._extend = function() {
	return function() {
		return exports.extend.apply(exports, [this].concat([].slice.call(arguments)) );
	};
};

// Partially apply a function
exports.partial = function(fn, args) {

	args = [].slice.call(arguments, 1);

	return function() {

		return fn.apply(this, args.concat([].slice.call(arguments)));
	};
};

exports._partial = function() {

	return function() {

		var NewClass = exports.partial.apply(exports, [this].concat([].slice.call(arguments)) );

		NewClass.__super__ = this.prototype;

		NewClass.prototype = Object.create(this.prototype);

		NewClass.extend = exports._extend();
		NewClass.partial = exports._partial();

		return NewClass;
	};
};

exports.freezeProperties = function(model, properties) {
	properties.forEach(function(prop) {
		try {
			Object.defineProperty(model, prop, {
				configurable: false,
				enumerable: false,
				value: model[prop],
				writable: false
			});
		} catch(e) {
			console.warn("Cannot freeze properties with this implementation of Object.defineProperty");
		}
	});
};