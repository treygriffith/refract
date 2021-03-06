var Model = require('./Model');

// A collection is an array-like object that contains other models
var Collection = Model.partial({}).extend(function(name, models, compare) {

	if(typeof models === 'function') {
		compare = models;
		models = undefined;
	}

	var collection = this;

	this.name = name || 'models';

	this.Model = Model;

	this.models = this['_'+this.name] = [];

	// how are models in this collection compared to each other?
	// e.g. by id?
	// default is strict equality (===)
	this.compare = compare || function(a, b) {
		return a === b;
	};

	// which events from child models do we ignore?
	// by default, we ignore add and remove, as they would be bubbling from child collections
	this.ignoreChildEvents = ['add', 'remove'];

	// reset the events on children when the ignored events are updated
	this.listenTo('ignoreChildEvents', function(childEvents) {

		this.removeEventsFromModels();
		this.applyEventsToModels();
	});

	// alias length property
	if(this.length === undefined) {
		Object.defineProperty(this, 'length', {
			configurable: false,
			enumerable: false,
			get: function() {

				return collection.models.length;
			},
			set: function(new_val) {

				collection.models.length = new_val;
			}
		});
	}

	// apply events when they're added
	this.on('add', function(models) {

		this.aliasIndexProperties();

		if(this === collection) {

			this.applyEventsToModels(models);
		}
	});

	// remove events when models are removed
	this.on('remove', function(models) {

		this.aliasIndexProperties();

		if(this === collection) {

			this.removeEventsFromModels(models);
		}
	});

	// set the initial models
	this.push.apply(this, models || []);

	return this;
});

// Copy array methods
Object.getOwnPropertyNames(Array.prototype).forEach(function(methodName) {

	if(typeof Array.prototype[methodName] === 'function') {

		Collection.prototype[methodName] = function() {

			var collection = this;

			var args = [].slice.call(arguments);

			// initialize the pushed or unshifted or spliced new models as models
			if(~["push", "unshift"].indexOf(methodName)) {

				args = args.map(function(arg) {
					return arg instanceof collection.Model ? arg : new collection.Model(arg);
				});

			} else if(methodName === 'splice' && args.length > 2) {

				args = args.slice(0, 2).concat(args.slice(2).map(function(arg) {
					return arg instanceof collection.Model ? arg : new collection.Model(arg);
				}));
			}

			var ret = Array.prototype[methodName].apply(this.models, args);

			// apply events to new models
			if(~["push", "unshift"].indexOf(methodName)) {

				this.emit('add', args);
			}

			// remove events from old models
			if(~["pop", "shift"].indexOf(methodName)) {

				this.emit('remove', [ret]);
			}

			// do both in the case of splice
			if(methodName === 'splice') {

				// only apply events if new elements are being added
				if(args.length > 2) {

					this.emit('add', args.slice(2));
				}

				// remove events
				if(args[1]) {
					this.emit('remove', ret);
				}

			}

			return ret;
		};
	}
});

// indexOf polyfill that uses Collection's comparison function (defaults to strict equality)
Collection.prototype.indexOf = function (searchElement /*, fromIndex */ ) {

	"use strict";

	if (this.models == null) {
		throw new TypeError();
	}

	var t = Object(this.models);
	var len = t.length >>> 0;

	if (len === 0) {
		return -1;
	}

	var n = 0;

	if (arguments.length > 1) {
		n = Number(arguments[1]);

		if (n != n) { // shortcut for verifying if it's NaN
			n = 0;
		} else if (n != 0 && n != Infinity && n != -Infinity) {
			n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
	}

	if (n >= len) {
		return -1;
	}

	var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

	for (; k < len; k++) {

		if (k in t && this.compare(t[k], searchElement)) {
			return k;
		}

	}

	return -1;
};

// update number-accessed properties when the length is updated
Collection.prototype.aliasIndexProperties = function() {

	var collection = this;

	this.forEach(function(val, i) {

		Object.defineProperty(collection, i, {
			configurable: true,
			enumerable: true,
			get: function() {

				return collection.models[i];
			},
			set: function(new_val) {

				new_val = new_val instanceof collection.Model ? new_val : new collection.Model(new_val);

				var ret = collection.models[i] = new_val;

				var arr = [];

				arr[i] = new_val;

				collection.emit('add', arr);

				return ret;
			}
		});

	});

	return this;
};

Collection.prototype.applyEventsToModels = function(models) {

	var collection = this;

	models = models || this.models;

	for(var evt in this._events) {
		// exclude ignored events from bubbling up from other collections
		if(this._events.hasOwnProperty(evt) && !~this.ignoreChildEvents.indexOf(evt)) {

			models.forEach(function(model) {

				if(model instanceof Model) {

					model.on.apply(model, [evt].concat(collection._events[evt]));
				}

			});
		}
	}

	return this;
};

Collection.prototype.removeEventsFromModels = function(models) {

	var collection = this;

	models = models || this.models;

	for(var evt in this._events) {
		if(this._events.hasOwnProperty(evt)) {

			models.forEach(function(model) {

				if(model instanceof Model) {

					model.off.apply(model, [evt].concat(collection._events[evt]));
				}

			});
		}
	}

	return this;
};

Collection.prototype.on = function(evt, fn) {

	// call the original method
	Collection.__super__.on.apply(this, [].slice.call(arguments));

	// apply listener to all the models in the collection
	this.forEach(function(model) {

		if(model instanceof Model) {
			model.on(evt, fn);
		}
	});

	return this;
};

Collection.prototype.once = function(evt, fn) {

	// call the original method
	Collection.__super__.once.apply(this, [].slice.call(arguments));

	// apply listener to all the models in the collection
	this.forEach(function(model) {

		if(model instanceof Model) {
			model.once(evt, fn);
		}
	});

	return this;
};

Collection.prototype.off = function(evt, fn) {

	// call the original method
	Collection.__super__.off.apply(this, [].slice.call(arguments));

	// remoe listener from all the models in the collection
	this.forEach(function(model) {

		if(model instanceof Model) {
			model.off(evt, fn);
		}
	});

	return this;
};

Collection.prototype.empty = function() {

	var old = this.slice();

	this.models = this['_'+this.name] = [];

	this.emit('remove', old);

	return this;
};

Collection.prototype.replace = function(models) {

	var collection = this;

	models = models || [];

	// add new elements
	models.forEach(function(model, i) {

		if(!collection[i] || !collection.compare(model, collection[i])) {

			collection.splice(i, 1, model);
		}
	});

	if(this.length - models.length > 0) {
		collection.splice(models.length, this.length - models.length);
	}

	return this;
};

module.exports = Collection;