var View = require('../View');

var Link = View.partial("<a></a>").extend(function(href, text) {

	var link = this;

	this.defineAttr("href");
	this.href = href || "";

	this.defineText();
	this.text = text;

	this.view.on('click', function(e) {
		e.preventDefault();

		link.emit('click');
	});

	return this;

});

module.exports = Link;