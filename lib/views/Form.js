var View = require('../View');

var Form = View.partial("<form></form>").extend(function(action, method) {

	var form = this;

	this.defineAttr("action", action || "");
	this.defineAttr("method", method || "GET");

	// add submission handler
	this.view.on("submit", function(e) {

		// this is a remnant of jQuery
		e.preventDefault();

		var data = {};

		// find all child nodes that are possible form elements
		this.find("input, textarea, select").forEach(function(elem, i) {

			var name = elem.getAttr('name'),
				type = elem.getAttr('type'),
				value = elem.getFormValue(),
				selected = elem.isSelected();

			if(name) {
				// record data
				if( (type === 'radio' && selected) ||
					(type !== 'radio' && type !== 'checkbox') ) {

					data[name] = value;

				} else if(type === 'checkbox' && selected) {

					data[name] = Array.isArray(data[name]) ? data[name] : [];

					data[name].push(value);
				}
			}
		});

		form.emit("submit", data);
	});

	// add change handler (compile data and emit)
	this.views.on("change", function() {

		var data = {};
		if(this.name) {
			data[this.name] = this.value;
		}

		form.emit("change", data);
	});

	return this;

});

Form.Label = View.extend(function(text, _for) {

	this.defineText();
	this.text = text;

	this.defineAttr("for", _for);

	return this;

}, "<label></label>");

Form.Input = View.partial("<input />").extend(function(type, name, value) {
	var input = this;

	this.defineAttr("type", type);

	this.defineAttr("name", name || "");

	this.listenTo("value", function(val) {
		this.view.setFormValue(val);
	});

	this.value = value || "";

	// automatically update values on change
	this.view.on("change", function(e) {
		input.value = this.getFormValue();

		input.emit("change", input.value);
	});

	return this;

});

Form.Submit = Form.Input.partial("submit");

Form.RadioButton = Form.Input.partial("radio");

Form.Checkbox = Form.Input.partial("checkbox");

Form.TextInput = Form.Input.partial("text");

Form.TextBox = View.partial("<textarea></textarea>").extend(function(name, value) {

	var textarea = this;

	this.defineAttr("name", name);

	this.defineText("value", value);

	// automatically update values on change
	this.view.on("change", function(e) {
		textarea.value = this.getFormValue();

		textarea.emit("change", textarea.value);
	});

	return this;
});

Form.Select = View.partial("<select></select>").extend(function(name, options) {

	var select = this;

	this.defineAttr("name", name);

	this.options = this.views;

	options = options || [];

	this.addOptions(options);

	// automatically update values on change
	this.view.on("change", function(e) {
		select.value = this.getFormValue();

		select.emit("change", select.value);
	});

	return this;

});

Form.Select.prototype.addOption = function(option) {
	return this.push(new Form.Select.Option(option));
};

Form.Select.prototype.addOptions = function(options) {
	var select = this;

	options.forEach(function(option) {
		select.addOption(option);
	});

	return this;
};

Form.Select.prototype.clearOptions = function() {
	this.empty();
	return this.options;
};


Form.Select.Option = View.partial("<option></option>").extend(function(opt) {

	var name = opt;

	if(typeof opt === 'object') {

		name = opt.name;
	}

	this.defineAttr("value", opt.value);

	this.defineAttr('selected', opt.selected);

	this.defineText("name", name);

	return this;

});

function addGeneric(Name) {
	return function() {
		var Constructor = function() {};
		Constructor.prototype = Name.prototype;

		var el = new Constructor();

		Name.apply(el, [].slice.call(arguments));

		return this.push(el);
	};
}

// Expose convenience push methods

Form.prototype.addLabel = addGeneric(Form.Label);
Form.prototype.addSubmit = addGeneric(Form.Submit);
Form.prototype.addRadioButton = addGeneric(Form.RadioButton);
Form.prototype.addCheckbox = addGeneric(Form.Checkbox);
Form.prototype.addTextInput = addGeneric(Form.TextInput);
Form.prototype.addTextBox = addGeneric(Form.TextBox);
Form.prototype.addSelect = addGeneric(Form.Select);


module.exports = Form;