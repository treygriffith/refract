exports.extend = function(Klass, Constructor, args) {
	args = [].slice.call(arguments, 2);

	var NewClass = function() {
		Klass.apply(this, args);

		Constructor.call(this);

		return this;
	};

	NewClass.prototype = Object.create(Klass.prototype);

	if(Klass.extend) {
		NewClass.extend = exports._extend(NewClass);
	}

	return NewClass;
};

exports._extend = function(O) {
	return function() {
		return utils.extend.apply(this, [O].concat([].slice.call(arguments)) );
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
		} catch(e) {}
	});
};