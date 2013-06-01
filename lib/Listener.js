
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

		// this test doesn't work for objects
		if(self.originalValue !== new_val && typeof self.originalValue !== 'object') {

			self.trigger('change', new_val, new_val);

			// test that these are not null and they are objects
		} else if(self.originalValue && new_val && typeof self.originalValue === 'object' && typeof new_val === 'object') {

			changes = findChanges(new_val, self.originalValue);

			// some changes were found
			if(length(changes[0]) || length(changes[1])) {

				self.trigger('change', new_val, changes[0], changes[1]);
			}
		}

		// the new value is undefined, and the old value was not - we can assume self property was deleted
		if(new_val === undefined && self.originalValue !== undefined) {

			self.trigger('delete', new_val);
		}

		// update the cached value that we compare against
		self.originalValue = clone(new_val);
	};
};

Listener.prototype.trigger = function(evt, new_val, changed, removed) {

	var model = this.model;

	this._events[evt].forEach(function(fn) {

		fn.call(model, new_val, changed, removed);
	});
};

Listener.prototype['for'] = function(evt, fn) {

	// add this function to the event list
	this._events[evt].push(fn);
};

module.exports = Listener;