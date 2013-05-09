var Listener = require('./Listener');


// several properties are immutable in order for it to work
function freezeProperties(model, properties) {
	properties.forEach(function(prop) {
		Object.defineProperty(model, prop, {
			configurable: false,
			enumerable: false,
			value: model[prop],
			writable: false
		});
	});
}

function Model(data) {
	var self = this;

	// define a unique id for each model for use in listenTo
	this.__unique = Model.unique(this);

	// add an array to keep track of all the properties we're tracking
	this.__listeningTo = {};
	this.__inprogress = {};

	// our private properties literal
	this.__properties = {};

	// freeze our important properties and functions
	freezeProperties(this, ['__unique', '__listeningTo', '__inprogress', '__properties', '__updateProperty', '__listenTo', '__bind']);

	for(var prop in data) {
		this[prop] = data[prop];
	}

	return this;
}

// keep track of all the different models we create
Model.id = Date.now();
Model.log = 0;

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
		var i = 0;
		for(var model in __models) {
			if(!__models[model]._active()) {

				delete __models[model];
			}
			i++;
		}
		// reset the timer
		releaseTimer = null;
	}

})({});


Model.create = function(self, data) {
	var Constructor = Model;
	var args = Array.prototype.slice.call(arguments, 1);
	var proto = self.__proto__;

	// inherit from another model creator instead of directly from Model
	if(typeof data === 'function') {
		Constructor = data;

		// the first arg is the constructor itself, so slice that off
		args = args.slice(1);
	}

	self.__proto__ = Object.create(Constructor.prototype);

	for(var p in proto) {
		self.__proto__[p] = proto[p];
	}

	Constructor.apply(self, args);

	return self;
};



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


	// return a listener if there is not callback passed
	if(!fn) {

		listener = new Listener(name, this);

		fn = listener.resolver();
	}

	// Add our function as one that is listening to this property
	listeningTo = this.__listeningTo[name] = this.__listeningTo[name] || [];

	listeningTo.push(fn);

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

	// we aren't already watching this property
	if(old_setter !== setter) {
		Object.defineProperty(this, name, {
			configurable: true,
			get: function() {

				// post a message to the window so we are notified that some changes to our object may have occurred
				// we check the type, because if it's not an object the setter will always get triggered
				if(!self.__inprogress[name] && typeof properties[name] === 'object') {

					self.__inprogress[name] = true;

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


Model.prototype.__updateProperty = function(property) {

	// check that this is a message about this object and we are listening for this property
	if(this.__listeningTo[property] && this.__listeningTo[property].length) {

		// re-set the object to itself to trigger our setter
		this[property] = this.__properties[property];

		// set our status back to ready to receive more messages
		this.__inprogress[property] = false;
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

	this.__listenTo(property).for('change', function(new_val, self) {

		// the callback has the passed model, the new value, and a reference to this
		fn(model, new_val, self);
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
	// no idea how to do this for arbitrary models
	return true;
};

module.exports = Model;

