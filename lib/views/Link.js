var View = require('../View');

var Link = View.extend(function(href, text) {
	View.create(this, "<a></a>");

	this.defineAttr("href");
	this.href = href || "";

	this.defineText();
	this.text = text;

	return this;

}, "<a></a>");

module.exports = Link;