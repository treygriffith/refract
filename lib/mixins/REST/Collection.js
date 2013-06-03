var http = require('./http');

module.exports = function collection(name, url) {

	var module = {};

	module.endpoint = url || '/'+name;

	module[name] = module[name] || [];

	module.compare = function(a, b) {
		return a === b;
	};

	module.add = function(item) {
		var model = this;
		var items = this[name];

		// add to our collection
		items.push(item);

		// return the xhr promise
		return http.post(this.endpoint, item).fail(function() {

			// remove the added item on failure
			items.forEach(function(_item, i) {


				if(model.compare(_item, item)) {

					items.splice(i, 1);
				}
			});
		});
	};

	module.fetch = function() {
		var model = this;

		// return the xhr promise
		return http.get(this.endpoint).done(function(items) {
			model[name] = items;
		});
	};

	return module;
};

var Collection = require('./Collection');
var http = require('./http');

var RESTCollection = Collection.extend(function(url) {
	
})