// Polyfills that will be needed for older browsers:
// Object.defineProperty (setter behavior)
// Object.getPropertyDescriptor (retrieve setter)

/**
 * Module Dependencies
 */
var Listener = require('./Listener');
var Controller = require('./Controller');
var utils = require('./utils');

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

	// freeze our important properties and functions
	utils.freezeProperties(this, ['__unique', '__listeningTo', '__inProgress', '__properties', '__updateProperties', '__listenTo', '__stopListeningTo', '__bind', '__destroy']);

	// assign our data to the model
	for(var prop in data) {
		this[prop] = data[prop];
	}

	// set this model's active state
	this.__active = true;

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

	// release objects from __models that are not in the DOM during a setTimeout
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
// It is not perfect - if the object is accessed, and then waits for callback to be changed, the setter won't be called

Model.prototype.__listenTo = function(name, fn) {

	var	properties = this.__properties,
		self = this,
		descriptor,
		old_setter,
		setter,
		listener,
		listeningTo;


	listener = new Listener(name, this);

	// the default thing to listen for is changes
	if(fn) {
		listener['for']('change', fn);
	}

	// Add our function as one that is listening to this property
	listeningTo = this.__listeningTo[name] = this.__listeningTo[name] || [];

	// the listener's resolver will get called when the property is set
	listeningTo.push(listener.resolver());

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
				if(!self.__inProgress[name] && typeof properties[name] === 'object' && properties[name]) {

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

	return listener;
};

Model.prototype.listenTo = Model.prototype.__listenTo;

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

// bind another model to listen for property changes in this model
Model.prototype.__bind = function(model, property, fn) {

	var firstSetter = true;

	// keep track of the original value
	var originalValue = this[property];

	// make sure that we call this function for the first time if this isn't the first setter for this property
	if(this.__properties[property] === originalValue) {
		firstSetter = false;
	}

	this.__listenTo(property, function(new_val, self, changed, removed) {

		// the callback has the passed model, the new value, and a reference to this
		fn(model, new_val, changed, removed);
	});

	// reset the value which triggers the initial binding;
	this[property] = originalValue;

	// manually trigger the initial binding if this isn't the first setter
	if(!firstSetter) {
		fn(model, originalValue, this);
	}
};

Model.prototype.bind = Model.prototype.__bind;


// determine if the current model is still active
Model.prototype._active = function() {
	return this.__active;
};

Model.prototype.__destroy = function() {
	this.__active = false;

	Model.destroy(this);
};

Model.prototype.destroy = Model.prototype.__destroy;

module.exports = Model;

