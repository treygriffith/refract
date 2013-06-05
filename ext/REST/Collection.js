var Collection = require('../../lib/Collection');
var http = require('./http');

var RESTCollection = Collection.extend(function(name, models, compare, url) {

	if(typeof models === 'function') {
		url = compare;
		compare = models;
		models = undefined;
	}

	if(typeof models === 'string') {
		url = models;

		models = compare = undefined;
	}

	if(typeof compare === 'string') {
		url = compare;
		compare = undefined;
	}

	Collection.call(this, name, models, compare);

	this.idName = 'id';

	this.url = url || '/'+name;

	return this;
});

RESTCollection.prototype.endpoint = function(elem) {

	if(elem) {

		return this.url + '/' + this[this.idName];
	}

	return this.url;
};

RESTCollection.prototype.index = function() {

	var collection = this;

	// return the xhr promise
	return http.get(collection.endpoint()).done(function(elems) {

		collection.replace(elems);
	});
};

RESTCollection.prototype.create = function(elem) {

	var collection = this;

	// push it onto the collection
	collection.push(elem);

	// return the xhr promise
	return http.post(collection.endpoint(), elem).fail(function() {

		// remove the item if the post fails
		collection.splice(collection.indexOf(item, 1));

	});
};

RESTCollection.prototype.show = function(elem) {

	var collection = this;

	var i = this.indexOf(elem);

	if(~i) {
		// return the xhr promise
		return http.get(collection.endpoint(elem)).done(function(data) {

			// update the item when the new data comes in
			for(var p in data) {
				if(data.hasOwnProperty(p)) {

					elem[p] = data[p];
				}
			}
		});
	}
};

RESTCollection.prototype.update = function(elem, changes) {

	var i = this.indexOf(elem);

	if(~i) {

		for(var p in changes) {
			if(changes.hasOwnProperty(p)) {

				elem[p] = changes[p];
			}
		}

		return http.post(this.endpoint(elem), changes);
	}
};

RESTCollection.prototype.destroy = function(elem) {

	var i = this.indexOf(elem);

	if(~i) {

		this.splice(i, 1);

		return http.delete(this.endpoint(elem));
	}
};

module.exports = RESTCollection;