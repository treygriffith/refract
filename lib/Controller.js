var utils = require('./utils');

function Controller(model) {

	if(model) {
		this.model = model;
	}

	this._events = {};

	utils.freezeProperties(this, ['_events']);

	return this;
}

// extend
Controller.extend = utils._extend();

// Allow mixins
Controller.prototype.mixin = function(module) {

	for(var propName in module) {

		if(module.hasOwnProperty(propName)) {

			this[propName] = module[propName];
		}
	}

	return this;
}

// add an event listener to this controller
Controller.prototype.on = function(evt, fn) {
	this._events[evt] = this._events[evt] || [];

	// support multiple functions at once
	if(Array.isArray(fn)) {

		this._events[evt] = this._events[evt].concat(fn);
	} else {

		this._events[evt].push(fn);
	}

	return this;
};

// add an event listener to this controller for only the next occurence of the event
Controller.prototype.once = function(evt, fn) {
	var controller = this;

	var handler = function() {
		controller.off(evt, handler);

		fn.apply(this, [].slice.call(arguments));
	};

	this.on(evt, handler);

	return this;
};

// remove an event listener from this controller
Controller.prototype.off = function(evt, fn) {

	if(fn) {

		var fns = this._events[evt] = this._events[evt] || [];

		for(var i = 0; i < fns.length; i++) {
			if(fns[i] === fn) {
				fns.splice(i, 1);
			}
		}
	} else {

		delete this._events[evt];
	}

	return this;
};

// emit an event from this controller
Controller.prototype.emit = function(evt, data) {
	var fns = this._events[evt] || [];
	var controller = this;

	fns.forEach(function(fn) {
		fn.call(controller, data);
	});

	return this;
};

module.exports = Controller;