var View = require('../View');

var ListInitializer = function(items, CustomItem) {

	this.listenTo('Item', function(Item) {
		this.views.Model = Item;
	});

	// allow for a custom intializer for Item
	this.Item = CustomItem || Item;

	// alias
	this.items = this.views;

	this.push.apply(this, items || []);

	return this;

};

var List = View.partial("<ul></ul>").extend(ListInitializer);

List.prototype.removeItem = function(item, compare) {
	for(var i=0; i<this.items.length; i++) {
		if(compare(item, this.items[i])) {
			this.removeViewAt(i);
		}
	}
};

List.prototype.removeItems = function(items, compare) {
	var list = this;

	items.forEach(function(item) {
		list.removeItem(item, compare);
	});
};

List.prototype.replaceItems = function(items) {
	return this.views.replace(items);
};

// Ordered list is the same as a List, but with different html tags
var OrderedList = View.partial("<ol></ol>").extend(ListInitializer);

OrderedList.prototype.__proto__ = List.prototype;


var Item = View.partial("<li></li>").extend(function(view) {

	if(view instanceof View) {
		this.views[0] = view;
	} else {
		this.defineText();
		this.text = view;
	}

	return this;

});


// Expose ordered list as a property of List
List.Ordered = OrderedList;

// Expose Item so it can be extended
List.Item = Item;

module.exports = List;