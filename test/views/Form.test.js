var View = require('../../lib/View');
var Form = require('../../lib/views/Form');

describe("Event Capturing", function() {

	it("captures submit events with form data", function(done) {

		var form = new Form();

		form.addTextInput('name', 'Name', 'Bob');
		form.addTextBox('text', 'Text', 'paragraph');
		form.addRadioButtons('choice', [
			{
				label: 'Red',
				value: 'r'
			},
			{
				label: 'Green',
				value: 'g'
			},
			{
				label: 'Blue',
				value: 'b'
			}
		], 'g');

		form.addCheckboxes('moreThanOne', [
			{
				label: 'One',
				value: 1
			},
			{
				label: 'Two',
				value: 2
			}
		], [1, 2]);

		form.addSubmit(undefined, 'Submit');

		form.on('submit', function(data) {

			assert.strictEqual(data.name, 'Bob');
			assert.strictEqual(data.text, 'paragraph');
			assert.strictEqual(data.choice, 'g');
			assert.sameMembers(data.moreThanOne, [1, 2]);

			assert.sameMembers(['name', 'text', 'choice', 'moreThanOne'], Object.keys(data));

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

			text.input.view.setFormValue(name);
			text.input.view.emit('change');

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

			nameInput.input.view.setFormValue(name);
			nameInput.input.view.emit('change');

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

			text.input.view.setFormValue(name);
			text.input.view.emit('change');

		}, 100);

	});
});

describe("Element Construction", function() {

	it("updates values of inputs automatically", function(done) {

		var form = View.Body.push(new Form());

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

		checkbox.value = ['18'];
		text.value = 'Albert';

		setTimeout(function() {

			var checkboxes = form.view.find('input[type="checkbox"]:checked');

			assert.strictEqual(checkboxes.length, 1);
			assert.strictEqual(checkboxes[0].getFormValue(), '18');

			var input = form.view.find('input[type="text"]')[0];

			assert.strictEqual(input.getFormValue(), 'Albert');

			done();
		}, 100);
	});

	it("updates values of radio buttons automatically", function(done) {

		var form = View.Body.push(new Form());

		var buttons = form.addRadioButtons("golf", [
			{
				label: "18 hole",
				value: '18'
			},
			{
				label: 'Scramble',
				value: 'scramble'
			}
		]);

		buttons.value = 'scramble';

		setTimeout(function() {

			var buttons = form.view.find('input[type="radio"]:checked');

			assert.strictEqual(buttons.length, 1);
			assert.strictEqual(buttons[0].getFormValue(), 'scramble');

			done();
		}, 100);
	});

	it("updates values of textareas automatically", function(done) {

		var form = View.Body.push(new Form());

		var longForm = "There is long form text in here.";

		var text = form.addTextBox("someText", "Type some stuff in here");

		text.value = longForm;

		setTimeout(function() {

			var textarea = form.view.find('textarea')[0];

			assert.strictEqual(textarea.getFormValue(), longForm);

			done();
		}, 100);

	});

	it("updates values of selects automatically", function(done) {

		var form = View.Body.push(new Form());

		var select = form.addSelect("golf", "Golf", [
			{
				name: "18 hole",
				value: '18'
			},
			"Scramble"
		]);

		select.value = 'Scramble';

		setTimeout(function() {

			var options = form.view.find('select')[0].find('option:selected');

			assert.strictEqual(options.length, 1);
			assert.strictEqual(options[0].getFormValue(), 'Scramble');

			done();
		}, 100);
	});

	it("updates the values of multiple selects automatically", function() {

	});
});