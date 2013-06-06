var Model = require('../../lib/Model');
var http = require('./http');

var RESTModel = Model.extend(function(data) {

	return this;

});

RESTModel.prototype.update = function(updates) {

		for(var p in updates) {
			if(updates.hasOwnProperty(p)) {

				this[p] = updates[p];
			}
		}

		return http.post(collection.endpoint(this), updates).fail(function() {
			// roll back changes
		});
};

RESTModel.prototype.show = function() {

	var model = this;

	// return the xhr promise
	return http.get(this.collection.endpoint(this)).done(function(data) {

		// update the item when the new data comes in
		for(var p in data) {
			if(data.hasOwnProperty(p)) {

				model[p] = data[p];
			}
		}
	});
};

RESTModel.prototype.destroy = function() {

	var model = this;

	var index = this.collection.indexOf(this);

	this.__active = false;

	this.emit('destroy', this);

	http.delete(this.collection.endpoint(this)).fail(function() {

		// undelete the model
		model.collection.splice(index, 0, model);
	});

	return RESTModel.__super__.destroy.call(this);
};

module.exports = RESTModel;