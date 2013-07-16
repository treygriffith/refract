var Link = require('../../lib/views/Link');
var View = require('../../lib/View');

describe("Link Creation", function() {
	it("updates the link target", function() {

		var link = new Link("http://google.com/", "Google");

		View.Body.push(link);

		assert.strictEqual(link.view.getProp('href'), "http://google.com/");

		link.href = 'http://yahoo.com/';
		link.text = 'Yahoo!';

		assert.strictEqual(link.view.getProp('href'), "http://yahoo.com/");
	});
});