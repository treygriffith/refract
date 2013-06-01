var View = require('../View');

var Text = View.extend(function() {

	this.defineText();
	this.text = text;

	return this;

}, "<span></span>");

var Header = View.extend(function(text, size) {

	size = size || 1;

	if(size !== 1) {
		var newView = new View.DOMBinding("<h"+size+"></h"+size+">");

		this.view.replaceWith(newView);

		this.view = newView;
	}

	this.defineText();
	this.text = text;

	return this;

}, "<h1></h1>");

Text.Header = Header;

var Block = View.extend(function(text) {

	this.defineText();
	this.text = text;

	return this;
});

Text.Block = Block;

module.exports = Text;