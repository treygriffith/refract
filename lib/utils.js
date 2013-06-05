exports.extend = function(Constructor, args) {
	var Klass = this;

	args = [].slice.call(arguments, 1);

	var NewClass = function() {
		Klass.apply(this, args);

		Constructor.apply(this, [].slice.call(arguments));

		return this;
	};

	NewClass.__super__ = Klass.prototype;

	NewClass.prototype = Object.create(Klass.prototype);

	if(Klass.extend) {
		NewClass.extend = exports._extend();
	}

	return NewClass;
};

exports._extend = function() {
	return function() {
		return exports.extend.apply(this, [].slice.call(arguments) );
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