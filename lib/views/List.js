var View = require('../View');

var List = View.extend(function(items, CustomItem) {

	// allow for a custom intializer for Item
	this.Item = CustomItem || Item;

	// alias
	this.items = this.views;

	items = items || [];

	this.addItems(items);

	return this;

}, "<ul></ul>");

List.prototype.addItem = function(item) {
	return this.push(new this.Item(item));
};

List.prototype.addItems = function(items) {
	var list = this;

	items.forEach(function(item) {
		list.addItem(item);
	});
};

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

List.prototype.removeAllItems = function() {
	this.empty();
	return this.items;
};

List.prototype.replaceItems = function(items) {
	var oldItems = this.removeAllItems();

	this.addItems(items);

	return oldItems;
};

// Ordered list is the same as a List, but with different html tags
var OrderedList = View.extend(function() {

	this.items = this.views;

	this.addItems(items);

	return this;
}, "<ol></ol>");

OrderedList.prototype.__proto__ = List.prototype;


var Item = View.extend(function(view) {

	if(view instanceof View) {
		this.views[0] = view;
	} else {
		this.defineText();
		this.text = view;
	}

	return this;

}, "<li></li>");


// Expose ordered list as a property of List
List.Ordered = OrderedList;

// Expose Item so it can be extended
List.Item = Item;

module.exports = List;