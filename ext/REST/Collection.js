var Collection = require('../../lib/Collection');
var RESTModel = require('./Model');
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

	this.idName = 'id';

	this.url = url || '/'+name;

	this.Model = RESTModel;

	this.on('add',function (models) {

		var collection = this;

		models.forEach(function(model) {
			model.collection = collection;
		});
	});

	// delete items from the collection if the models emit a destroy
	this.on('destroy', function(elem) {

		this.splice(this.indexOf(elem, 1));
	});

	this.replace(models);

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

	this.emit('create', elem);

	// return the xhr promise
	return http.post(collection.endpoint(), elem).fail(function() {

		// remove the item if the post fails
		this.emit('destroy', elem);

	});
};

RESTCollection.prototype.show = function(elem) {

	var collection = this;

	var i = this.indexOf(elem);

	if(~i) {
		return elem.show.apply(elem, [].slice.call(arguments, 1));
	}

	return false;
};

RESTCollection.prototype.update = function(elem, changes) {

	var i = this.indexOf(elem);

	if(~i) {

		return elem.update.apply(elem, [].slice.call(arguments, 1));
	}

	return false;
};

RESTCollection.prototype.destroy = function(elem) {

	var i = this.indexOf(elem);

	if(~i) {

		return elem.destroy.apply(elem, [].slice.call(arguments, 1));
	}

	return false;
};

module.exports = RESTCollection;