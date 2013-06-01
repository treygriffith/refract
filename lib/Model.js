// Polyfills that will be needed for older browsers:
// Object.defineProperty (setter behavior)
// Object.getPropertyDescriptor (retrieve setter)

/**
 * Module Dependencies
 */
var Listener = require('./Listener');
var Controller = require('./Controller');
var utils = require('./utils');

// Model extends Controller, it has access to the Events API
var Model = Controller.extend(function (data) {
	var self = this;

	// define a unique id for each model for use in listenTo
	this.__unique = Model.unique(this);

	// add an array to keep track of all the properties we're tracking
	this.__listeningTo = {};

	// which properties are already in progress
	this.__inProgress = {};

	// our private properties literal
	this.__properties = {};

	// freeze our important properties
	utils.freezeProperties(this, ['__unique', '__listeningTo', '__inProgress', '__properties']);

	// assign our data to the model
	for(var prop in data) {
		this[prop] = data[prop];
	}

	// set this model's active state
	Object.defineProperty(this, '__active', {
		enumerable: false,
		writable: true,
		configurable: false,
		value: true
	});

	return this;
});


// keep track of all the different models we create
Model.id = Date.now();
Model.log = 0;

// how often do we check for changes in the data?
/*
var defaultHertz = 60;
var hertz = defaultHertz;
var timer;
var checkModels;

Model.setHertz = function(newHertz) {
	hertz = newHertz;

	window.clearInterval(timer);

	timer = window.setInterval(checkModels, hertz);

	return hertz;
};

Model.getHertz = function() {
	return hertz;
};
*/

// hide this reference in an immediately invoked function
(function(__models) {

	var releaseTimer;

	Model.unique = function(self) {

		var id = Model.id + (Model.log++).toString();

		__models[id] = self;


		// start a setTimeout to kill any old models if there isn't one scheduled already
		// by triggering a release of models upon model creation, we know we can kill errant models
		if(!releaseTimer) {
			releaseTimer = window.setTimeout(releaseOldModels, 1000);
		}

		return id;
	};
/*
	checkModels = function() {
		for(var model in __models) {
			__models[model].__updateProperties();
		}
	};

	// start the timer for data checking
	timer = window.setInterval(checkModels, hertz);

*/

	//add a global postMessage listener to notify models when their properties change
	window.addEventListener('message', function(evt) {
		var id,
			property,
			split,
			model;

		if(evt && evt.data) {

			split = evt.data.split(':');
			id = split[0];
			property = split[1];
			model = __models[id];

			if(model) {
				model.__updateProperty(property);
			}
		}
	}, false);

	// release objects from __models that are not active after a setTimeout (notably View models that are not in the DOM)
	// setTimeout shouldn't trigger until all our current code is done executing, so any models should be rendered
	// this allow them to be garbage collected
	function releaseOldModels() {
		for(var model in __models) {
			if(!__models[model]._active()) {

				delete __models[model];
			}
		}
		// reset the timer
		releaseTimer = null;
	}

	Model.destroy = function(model) {
		for(var id in __models) {
			if(__models[id] === model) {
				delete __models[id];
			}
		}
	};

})({});

// listen for changes to a property on an object.
// This functions similarly to a Proxy trap for a setter in ES Harmony, as it also gets called (eventually) when properties of the property are changed
// It is not perfect - if a property object is accessed (stored in another variable), and is not changed immediately, the setter might not be called.

Model.prototype.__listenTo = function(name, fn, shallow) {

	var	properties = this.__properties,
		self = this,
		descriptor,
		old_setter,
		setter,
		listener,
		listeningTo,
		firstSetter = true,
		originalValue,
		resolver;

	// keep track of the original value
	originalValue = this[name];

	// make sure that we call this function for the first time if this isn't the first setter for this property
	if(properties[name] === originalValue) {
		firstSetter = false;
	}

	// create a listener for this property
	listener = new Listener(name, this);

	// the default thing to listen for is changes
	if(fn) {
		listener['for']('change', fn);
	}

	// Add our function as one that is listening to this property
	listeningTo = this.__listeningTo[name] = this.__listeningTo[name] || [];

	// the listener's resolver will get called when the property is set
	resolver = listener.resolver();
	listeningTo.push(resolver);

	// get the previous setter (if there was one) so we maintain old behavior
	descriptor = Object.getOwnPropertyDescriptor(this, name);
	old_setter = descriptor && descriptor.set;

	// define our setter so we can check if we are already listening to this property
	setter = function(new_val) {

		// call our listeners
		listeningTo.forEach(function(fn) {
			fn(new_val, self);
		});

		// call the old setter
		if(old_setter) {
			old_setter(new_val);
		}

		// update the value
		properties[name] = new_val;

		return;
	};

	// check that we aren't already watching this property
	// NOTE: I don't think this works because we're instantiating a new anon function, which would make it not identical
	if(old_setter !== setter) {
		Object.defineProperty(this, name, {
			configurable: true,
			enumerable: true,
			get: function() {

				// post a message to the window so we are notified that some changes to our object may have occurred
				// we check the type, because if it's not an object the setter will always get triggered
				if(!self.__inProgress[name] && typeof properties[name] === 'object' && properties[name] && !shallow) {

					self.__inProgress[name] = true;

					// postMessage will occur after any code involving the received object has finished executing (similar to process.nextTick)
					// we're serializing our two pieces of data because not all browsers support passing objects
					window.postMessage(self.__unique + ':' + name, '*');
				}

				// return the actual value
				return properties[name];
			},
			set: setter
		});
	}

	// reset the value which triggers the initial binding;
	this[name] = originalValue;

	// manually trigger the initial binding if this isn't the first setter
	if(!firstSetter) {
		resolver(originalValue, this);
	}

	return listener;
};

Model.prototype.listenTo = Model.prototype.__listenTo;

Model.prototype.__shallowListenTo = function(name, fn) {
	return this.__listenTo(name, fn, true);
};

Model.prototype.shallowListenTo = Model.prototype.__shallowListenTo;

// Stop listening for changes to a property
// Note: this removes old setters and getters. If you have previous behavior you want to maintain, you have to keep track of that yourself
Model.prototype.__stopListeningTo = function(name) {

	// remove listeners
	delete this.__listeningTo[name];

	// redefine this property as a data value
	Object.defineProperty(this, name, {
		configurable: true,
		enumerable: true,
		value: this.__properties[name],
		writable: true
	});
};

Model.prototype.stopListeningTo = Model.prototype.__stopListeningTo;

// Trigger the model to update a particular property (which triggers its setter)
Model.prototype.__updateProperty = function(property) {

	// check that this is a message about this object and we are listening for this property
	if(this.__listeningTo[property] && this.__listeningTo[property].length) {

		// re-set the object to itself to trigger our setter
		this[property] = this.__properties[property];

		// set our status back to ready to receive more messages
		this.__inProgress[property] = false;
	}
};

// determine if the current model is still active
// This is not a protected function - each model might have different ways of determining if it is still active
Model.prototype._active = function() {
	return this.__active;
};

Model.prototype.__destroy = function() {
	this.__active = false;

	Model.destroy(this);
};

Model.prototype.destroy = Model.prototype.__destroy;

module.exports = Model;

