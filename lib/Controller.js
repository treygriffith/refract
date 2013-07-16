var utils = require('./utils');

function Controller(model) {

	if(model) {
		this.model = model;
	}

	this._events = {};

	this._repeaters = {};

	utils.freezeProperties(this, ['_events', '_repeaters']);

	return this;
}

// extend
Controller.extend = utils._extend();
//partial
Controller.partial = utils._partial();

// add an event listener to this controller
Controller.prototype.on = function(evt, fn) {
	this._events[evt] = this._events[evt] || [];

	// support multiple functions at once
	var fns = [].slice.call(arguments, 1);

	this._events[evt] = this._events[evt].concat(fns);

	return this;
};

/**
 * Remove listener for an event
 * @param  {String}   evt Event to remove listener(s) for
 * @param  {Function | Array} fn  Optional parameter, indicating the specific listener or array of listeners to remove
 * @return {Controller}       Modified controller
 */
Controller.prototype.off = function(evt, fn) {

	var controller = this;

	if(fn) {

		// handle multiple handlers
		if(arguments.length > 2) {

			[].slice.call(arguments, 1).forEach(function(fn) {

				controller.off(evt, fn);
			});

			return this;
		}

		var fns = this._events[evt] = this._events[evt] || [];

		// reverse for-loop since we're splicing items out of it
		for(var i = fns.length - 1; i >= 0; i--) {
			if(fns[i] === fn) {
				fns.splice(i, 1);
			}
		}

	} else {

		this._events[evt] = [];
	}

	return this;
};

// add an event listener to this controller for only the next occurence of the event
Controller.prototype.once = function(evt, fn) {
	var controller = this;

	// apply individually for multiple handlers
	if(arguments.length > 2) {

		[].slice.call(arguments, 1).forEach(function(fn) {

			controller.once(evt, fn);
		});
		return this;
	}

	var handler = function() {
		controller.off(evt, handler);

		fn.apply(this, [].slice.call(arguments));
	};

	this.on(evt, handler);

	return this;
};

/**
 * Repeat events from another controller in the context of this controller
 * @param  {Controller} sourceController Controller that is generating the event
 * @param  {String} evt                  Name of the event to repeat
 * @return {Controller}                  This controller
 */
Controller.prototype.repeat = function(sourceController, evt) {

	var targetController = this;

	this._repeaters[evt] = this._repeaters[evt] || [];

	var handler = function(data) {

		console.log("emitting repeated event for", evt);
		console.log(sourceController);

		targetController.emit(evt, data);
	};

	// store the handler so we can remove it if need be
	this._repeaters[evt].push(handler);

	sourceController.on(evt, handler);

	return this;
};

Controller.prototype.stopRepeating = function(sourceController, evt) {

	sourceController.off.apply(sourceController, [evt].concat(this._repeaters[evt] || []));

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