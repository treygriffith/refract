var View = require('../View');
var $ = View.$;

var Text = View.extend(function() {

	this.defineText();
	this.text = text;

}, "<span></span>");

var Header = View.extend(function(text, size) {

	size = size || 1;

	this.view = $("<h"+size+"></h"+size+">");

	this.defineText();
	this.text = text;
});

Text.Header = Header;

var Block = View.extend(function(text) {

	this.defineText();
	this.text = text;

});

Text.Block = Block;

module.exports = Text;