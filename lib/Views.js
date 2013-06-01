var Model = require('./Model');
var Controller = require('./Controller');

// Views is a nearly-array object for containing the views of a View
var Views = Model.extend(function(views) {

	this._views = [];

	// Our listener for changes in the array
	this._handler = function(_views) {

		var self = this;

		// update length
		this.length = _views.length;

		// apply all of our events to the changed/added views
		for(var evt in this._events) {
			if(this._events.hasOwnProperty(evt)) {

				_views.forEach(function(view) {

					// remove old listeners
					view.off(evt, self._events[evt]);

					// add all of our listeners
					view.on(evt, self._events[evt]);
				});

			}
		}
	}

	this.shallowListenTo('_views', this._handler);

	// save a reference to the original way of attaching listeners
	this._on = Controller.prototype.on;

	this.length = this._views.length;

	// set the initial views
	this._views = views || [];

	return this;
});

// Copy array methods
Object.getOwnPropertyNames(Array.prototype).forEach(function(methodName) {

	if(typeof Array.prototype[methodName] === 'function') {

		Views.prototype[methodName] = function() {

			var ret = Array.prototype[methodName].apply(this._views, [].slice.call(arguments));

			// call our handler if it modified the array
			if(~["push", "pop", "shift", "unshift", "splice"].indexOf(methodName)) {
				this._handler.call(this, this._views);
			}

			return ret;
		};
	}
});

Views.prototype.on = function(evt, fn) {

	// call the original method
	this._on.apply(this, [].slice.call(arguments));

	// trigger the setter
	this._views = this._views;

	return this;
};

Views.prototype.empty = function() {
	this._views = [];

	return this;
};

module.exports = Views;