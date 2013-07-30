var View = require('../lib/View');

describe("Style Manipulation", function() {

	it("updates a single style change instantly", function(done) {

		var div = new View();

		div.style.backgroundColor = 'green';

		setTimeout(function() {
			assert.strictEqual(div.view.getDOM().style.backgroundColor, 'green');

			done();
		}, 100);

	});

	it("updates multiple changes at once", function(done) {

		var div = new View();

		div.style.borderColor = 'orange';

		div.updateStyle({
			backgroundColor: 'green',
			color: 'gray'
		});

		setTimeout(function() {
			assert.strictEqual(div.view.getDOM().style.backgroundColor, 'green');
			assert.strictEqual(div.view.getDOM().style.color, 'gray');
			assert.strictEqual(div.view.getDOM().style.borderColor, 'orange');

			done();	
		}, 100);

	});
});

describe("Attribute Manipulation", function() {

	it("updates id automatically", function() {

		var div = new View("<div id='goof'></div>");

		View.Body.push(div);

		div.id = 'hooligans';

		assert.strictEqual(window.document.getElementById('hooligans'), div.view.getDOM());
	});

	it("updates class automatically", function() {

		var div = new View("<div class='hello'></div>");

		div.class = 'goodbye';

		assert.strictEqual(div.view.getDOM().className, 'goodbye');
	});

	it("updates text node when listened to", function() {

		var div = new View();

		div.defineText();

		div.text = 'hello';

		assert.strictEqual(div.view.getDOM().childNodes[0].nodeValue, 'hello');
	});

	it("updates arbitrary attributes when listened to", function() {

		var div = new View();

		div.defineAttr("arb", "arb");

		div['arb'] = 'arbor day';

		div.view.$.prop('arb', 'arbor day');

		assert.strictEqual(div.view.getDOM().getAttribute('arb'), 'arbor day');
	});
});

describe("Relationship to the Document", function() {

	it("attaches views to the document", function() {

		var div = new View();

		assert.isFalse(div.view.inDOM());

		View.Body.push(div);

		assert.isTrue(div.view.inDOM());
	});

	it("attaches sub-views to the document", function() {

		var div = new View();
		var p = new View("<p></p>");

		div.push(p);

		assert.isFalse(p.view.inDOM());

		View.Body.push(div);

		assert.isTrue(p.view.inDOM());
	});
});

describe("Manipulating Views", function() {

	it("adds views and retrieves them predictably", function() {

		var div = new View();
		var p = new View("<p></p>");
		var span = new View("<span></span>");
		var h1 = new View("<h1></h1>");

		div.push(p);
		div.push(span);
		div.push(h1);

		assert.strictEqual(p, div.getViewAt(0));
		assert.strictEqual(0, div.getPositionOf(p));

		assert.strictEqual(span, div.getViewAt(1));
		assert.strictEqual(1, div.getPositionOf(span));

		assert.strictEqual(h1, div.getViewAt(2));
		assert.strictEqual(2, div.getPositionOf(h1));
	});

	it("adds views in random order", function() {

		var div = new View();
		var p = new View("<p></p>");
		var span = new View("<span></span>");
		var h1 = new View("<h1></h1>");

		div.push(p);
		div.push(span);
		div.addViewAt(h1, 1);

		assert.strictEqual(p, div.getViewAt(0));
		assert.strictEqual(0, div.getPositionOf(p));

		assert.strictEqual(h1, div.getViewAt(1));
		assert.strictEqual(1, div.getPositionOf(h1));

		assert.strictEqual(span, div.getViewAt(2));
		assert.strictEqual(2, div.getPositionOf(span));
	});

	it("removes views", function() {

		var div = new View();
		var p = new View("<p></p>");
		var span = new View("<span></span>");
		var h1 = new View("<h1></h1>");

		div.push(p, span, h1);

		View.Body.push(div);

		assert.isTrue(p.view.inDOM());
		assert.isTrue(span.view.inDOM());
		assert.isTrue(h1.view.inDOM());

		div.removeViewAt(0);

		assert.isFalse(p.view.inDOM());
		assert.isTrue(span.view.inDOM());
		assert.isTrue(h1.view.inDOM());
	});

	it("removes all views", function() {

	});

	it("replaces views", function() {

		var div = new View();
		var p = new View("<p></p>");
		var span = new View("<span></span>");
		var h1 = new View("<h1></h1>");

		div.push(p, span);

		View.Body.push(div);

		div.replaceView(p, h1);

		assert.isTrue(span.view.inDOM());
		assert.isTrue(h1.view.inDOM());
		assert.isFalse(p.view.inDOM());
	});

	it("replaces all views", function() {

	});

});