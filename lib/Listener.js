
var utils = require('./utils');

// find number of properties in an object
function length(o) {
	var l = 0;
	for(var p in o) {
		if(o.hasOwnProperty(p)) {
			l++;
		}
	}

	return l;
}

// deep clone of object with lookouts for circular references
function clone(obj, found) {

	var newObj = Array.isArray(obj) ? [] : {};

	// objects that we have already found
	found = found || [];

	if(obj && typeof obj == 'object') {

		// we've previously encountered this object, don't recurse again
		if(~found.indexOf(obj)) {
			return obj;
		}

		found.push(obj);

		for(var p in obj) {
			if(obj.hasOwnProperty(p)) {

				newObj[p] = clone(obj[p], found);
			}
		}

		return newObj;
	}


	return obj;
}

// find which properties of an object actually changed
// obj1 is the new object, obj2 is the old one to compare against
function findChanges(obj1, obj2, found) {
	var changes = Array.isArray(obj1) ? [] : {};
	var removed = Array.isArray(obj2) ? [] : {};
	var temp = {};

	// objects that we have already found
	found = found || [];

	found.push(obj1);

	for(var p in obj1) {
		// check that we haven't already found this object, to prevent circular references
		if(obj1.hasOwnProperty(p) && !~found.indexOf(obj1[p])) {

			// object, so we recurse
			if(obj1[p] && obj2[p] && typeof obj1[p] === 'object' && typeof obj2[p] === 'object') {

				temp = findChanges(obj1[p], obj2[p], found);

				if(length(temp[0])) {
					changes[p] = temp[0];
					temp = {};
				}

			// not an object
			} else {

				if(obj1[p] !== obj2[p]) {

					changes[p] = obj1[p];
				}
			}
		}
	}

	for(var p in obj2) {
		if(obj2.hasOwnProperty(p) && !obj1.hasOwnProperty(p)) {
			removed[p] = obj2[p];
		}
	}

	return [changes, removed];
}


function Listener(name, model) {

	this.model = model;
	this.property = name;

	this.originalValue = clone(model.__properties[name]);

	this._events = {
		change: [],
		'delete': []
	};

	return this;
}

Listener.prototype.resolver = function() {

	var self = this;

	return function(new_val, model) {

		var changes;

		if(utils.isObject(self.originalValue) && utils.isObject(new_val)) {

			changes = findChanges(new_val, self.originalValue);

			// some changes were found
			if(length(changes[0]) || length(changes[1])) {

				self.emit('change', new_val, changes[0], changes[1]);
			}

		} else if(self.originalValue !== new_val) {

			self.emit('change', new_val, new_val);
		}

		// the new value is undefined, and the old value was not - we can assume self property was deleted
		if(new_val === undefined && self.originalValue !== undefined) {

			self.emit('delete', new_val);
		}

		// update the cached value that we compare against
		self.originalValue = clone(new_val);
	};
};

Listener.prototype.emit = function(evt, new_val, changed, removed) {

	var model = this.model;

	this._events[evt].forEach(function(fn) {

		fn.call(model, new_val, changed, removed);
	});

	return this;
};

Listener.prototype['for'] = function(evt, fn) {

	// add this function to the event list
	this._events[evt].push(fn);

	return this;
};

module.exports = Listener;