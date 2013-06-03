var Model = require('./Model');

// A collection is an array-like object that contains other models
var Collection = Model.extend(function(name, models) {

	this.name = name || 'items';

	// set the initial views
	this['_'+name] = models || [];

	this.length = this['_'+name].length;

	// apply initial events to models
	this.applyEventsToModels();

	return this;
});

// Copy array methods
Object.getOwnPropertyNames(Array.prototype).forEach(function(methodName) {

	if(typeof Array.prototype[methodName] === 'function') {

		Collection.prototype[methodName] = function() {

			var args = [].slice.call(arguments);

			var ret = Array.prototype[methodName].apply(this['_'+this.name], args);

			this.length = this['_'+this.name].length;

			// apply events to new models
			if(~["push", "unshift"].indexOf(methodName)) {

				this.applyEventsToModels(args);
			}

			// remove events from old models
			if(~["pop", "shift"].indexOf(methodName)) {

				this.applyEventsToModels(ret);
			}

			// do both in the case of splice
			if(methodName === 'splice') {

				// only apply events if new elements are being added
				if(args.length > 2) {

					this.applyEventsToModels(args.slice(2));
				}

				// remove events
				this.removeEventsFromModels(ret);
			}

			this.emit(methodName);

			return ret;
		};
	}
});

Collection.prototype.applyEventsToModels = function(models) {

	models = models || this['_'+this.name];

	for(var evt in this._events) {
		if(this._events.hasOwnProperty(evt)) {

			models.forEach(function(model) {

				model.on(evt, this._events[evt]);

			});
		}
	}

	return this;
};

Collection.prototype.removeEventsFromModels = function(models) {

	models = models || this['_'+this.name];

	for(var evt in this._events) {
		if(this._events.hasOwnProperty(evt)) {

			models.forEach(function(model) {

				model.off(evt, this._events[evt]);

			});
		}
	}

	return this;
};

Collection.prototype.on = function(evt, fn) {

	// call the original method
	this.__super__.on.apply(this, [].slice.call(arguments));

	// apply listener to all the models in the collection
	this.forEach(function(model) {
		model.on(evt, fn);
	});

	return this;
};

Collection.prototype.once = function(evt, fn) {

	// call the original method
	this.__super__.once.apply(this, [].slice.call(arguments));

	// apply listener to all the models in the collection
	this.forEach(function(model) {
		model.once(evt, fn);
	});

	return this;
};

Collection.prototype.off = function(evt, fn) {

	// call the original method
	this.__super__.off.apply(this, [].slice.call(arguments));

	// remoe listener from all the models in the collection
	this.forEach(function(model) {
		model.off(evt, fn);
	});

	return this;
};

Collection.prototype.empty = function() {

	this['_'+this.name] = [];

	this.length = 0;

	return this;
};

module.exports = Collection;