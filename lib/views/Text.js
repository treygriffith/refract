var View = require('../View');
var $ = View.$;

var Text = View.extend(function() {

	this.defineText();
	this.text = text;

}, "<span></span>");

var Header = View.extend(function(text, size) {

	size = size || 1;

	if(size !== 1) {
		var newView = $("<h"+size+"></h"+size+">");

		this.view.replaceWith("<h"+size+"></h"+size+">");

		this.view = newView;
	}

	this.defineText();
	this.text = text;
}, "<h1></h1>");

Text.Header = Header;

var Block = View.extend(function(text) {

	this.defineText();
	this.text = text;

});

Text.Block = Block;

module.exports = Text;