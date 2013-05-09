/**
 * Module Dependencies
 */
var Listener = require('./Listener');
var utils = require('./utils');

function Model(data) {
	var self = this;

	// define a unique id for each model for use in listenTo
	this.__unique = Model.unique(this);

	// add an array to keep track of all the properties we're tracking
	this.__listeningTo = {};

	// our private properties literal
	this.__properties = {};

	// freeze our important properties and functions
	utils.freezeProperties(this, ['__unique', '__listeningTo', '__properties', '__updateProperties', '__listenTo', '__bind', '__destroy']);

	// assign our data to the model
	for(var prop in data) {
		this[prop] = data[prop];
	}

	// set this model's active state
	this.__active = true;

	return this;
}

// extend
Model.extend = utils._extend(Model);

// keep track of all the different models we create
Model.id = Date.now();
Model.log = 0;

// how often do we check for changes in the data?
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

	checkModels = function() {
		for(var model in __models) {
			__models[model].__updateProperties();
		}
	};

	// start the timer for data checking
	timer = window.setInterval(checkModels, hertz);

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

Model.prototype.__listenTo = function(name, fn) {

	var	listener = new Listener(name, this);

	// the default thing to listen for is changes
	if(fn) {
		listener['for']('change', fn);
	}

	// Add our function as one that is listening to this property
	this.__listeningTo[name] = this.__listeningTo[name] || [];

	this.__listeningTo.push(listener.resolver());

	return listener;
};

Model.prototype.listenTo = Model.prototype.__listenTo;

Model.prototype.__updateProperties = function() {
	var props = this.__properties;
	var self = this;
	// loop over all listened to properties
	for(var prop in this.__listeningTo) {
		if(this.__listeningTo.hasOwnProperty(prop)) {

			// call the listeners
			this.__listeningTo[prop].forEach(function(fn) {

				fn(props[prop], self);
			});
		}
	}
};

// bind another model to listen for property changes in this model
Model.prototype.__bind = function(model, property, fn) {

	this.__listenTo(property, function(new_val, self) {

		// the callback has the passed model, the new value, and a reference to this
		fn(model, new_val, self);
	});
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

