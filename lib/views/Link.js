var View = require('../View');

var Link = View.partial("<a></a>").extend(function(href, text) {

	this.defineAttr("href");
	this.href = href || "";

	this.defineText();
	this.text = text;

	return this;

});

module.exports = Link;