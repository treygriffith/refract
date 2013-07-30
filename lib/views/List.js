var View = require('../View');

var ListInitializer = function(items, CustomItem) {

	this.listenTo('Item', function(Item) {
		this.views.Model = Item;
	});

	// allow for a custom intializer for Item
	this.Item = CustomItem || Item;

	// alias?

	this.push.apply(this, items || []);

	return this;

};

var List = View.partial("<ul></ul>").extend(ListInitializer);

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