var utils = require('./utils');

function Controller(model) {

	if(model) {
		this.model = model;
	}

	this._events = {};

	this.views = {};

	return this;
}

// extend
Controller.extend = utils._extend(Controller);

// add an event listener to this controller
Controller.prototype.on = function(evt, fn) {
	this._events[evt] = this._events[evt] || [];

	this._events[evt].push(fn);
};

// add an event listener to this controller for only the next occurence of the event
Controller.prototype.once = function(evt, fn) {
	var controller = this;

	var handler = function() {
		controller.off(evt, handler);

		fn.apply(this, Array.prototype.slice.call(arguments));
	};

	this.on(evt, handler);
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
};

// emit an event from this controller
Controller.prototype.emit = function(evt) {
	var fns = this._events[evt] || [];
	var controller = this;

	fns.forEach(function(fn) {
		fn(controller);
	});
};

module.exports = Controller;