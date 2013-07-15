var View = require('../../lib/View');
var Form = require('../../lib/views/Form');

describe("Event Capturing", function() {

	it("captures submit events with form data", function(done) {

		var form = new Form();

		form.addTextInput('name', 'Bob');
		form.addTextBox('text', 'paragraph');
		form.addSubmit(undefined, 'Submit');

		form.on('submit', function(data) {

			assert.strictEqual(data.name, 'Bob');
			assert.strictEqual(data.text, 'paragraph');

			assert.sameMembers(['name', 'text'], Object.keys(data));

			done();
		});

		View.Body.push(form);

		setTimeout(function() {
			form.view.emit('submit');
		}, 100);

	});

	it("captures change events for individual elements", function(done) {

		var name = "Edward Snowden";

		var text = new Form.TextInput('name');

		text.on('change', function(value) {

			assert.strictEqual(value, name);
			assert.strictEqual(this, text);
			assert.strictEqual(this.value, value);

			done();
		});

		View.Body.push(text);

		// artificially trigger a change event
		setTimeout(function() {

			text.view.setFormValue(name);
			text.view.emit('change');

		}, 100);
	});

	it("captures change events on the form level", function(done) {

		var form = new Form();

		var name = "Bob";

		var nameInput = form.addTextInput('name');
		var text = form.addTextBox('text', "paragraph");
		form.addSubmit(undefined, "Submit");

		form.on('change', function(data) {

			assert.strictEqual(data.name, name);
			assert.strictEqual(this, form);

			assert.sameMembers(['name'], Object.keys(data));

			done();
		});

		View.Body.push(form);

		// artificially trigger a change event
		setTimeout(function() {

			nameInput.view.setFormValue(name);
			nameInput.view.emit('change');

		}, 100);
	});

	it("captures change events for elements added after the listener", function(done) {

		var form = new Form();

		var name = "Bob";

		form.addTextInput('name');
		form.addSubmit(undefined, "Submit");

		form.on('change', function(data) {

			assert.strictEqual(data.text, name);
			assert.strictEqual(this, form);

			assert.sameMembers(['text'], Object.keys(data));

			done();
		});

		View.Body.push(form);

		var text = form.addTextBox('text', "paragraph");

		// artificially trigger a change event
		setTimeout(function() {

			text.view.setFormValue(name);
			text.view.emit('change');

		}, 100);

	});
});

describe("Element Construction", function() {

	it("updates values of inputs automatically", function() {

		var form = new Form();

		var text = form.addTextInput("name");

		var checkbox = form.addCheckboxes("golf", [
			{
				label: "18 hole",
				value: '18'
			},
			{
				label: 'Scramble',
				value: 'scramble'
			}
		]);

		checkbox.value
	});

	it("updates values of textareas automatically", function() {

	});

	it("updates values of selects automatically", function() {

	});
});