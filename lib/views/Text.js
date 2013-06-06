var View = require('../View');

var Text = View.partial("<span></span>").extend(function() {

	this.defineText();
	this.text = text;

	return this;

});

var Header = View.partial("<h1></h1>").extend(function(text, size) {

	size = size || 1;

	if(size !== 1) {
		var newView = new View.DOMBinding("<h"+size+"></h"+size+">");

		this.view.replaceWith(newView);

		this.view = newView;
	}

	this.defineText();
	this.text = text;

	return this;

});

Text.Header = Header;

var Block = View.partial("<div></div>").extend(function(text) {

	this.defineText();
	this.text = text;

	return this;
});

Text.Block = Block;

module.exports = Text;