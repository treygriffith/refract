var View = require('../View');

var Form = View.partial("<form></form>").extend(function(action, method) {

	var form = this;

	this.defineAttr("action", action || "");
	this.defineAttr("method", method || "GET");

	// add submission handler
	this.view.on("submit", function(e) {

		// standardized event api
		e.preventDefault();

		var data = {};

		// recursive to extract data from form elements nested inside other views
		var extractFormData = function(view) {
			console.log(view);
			console.log(form.isFormElement(view));
			if(form.isFormElement(view)) {
				data[view.name] = view.value;
			} else {
				view.views.forEach(extractFormData);
			}
		};

		form.views.forEach(extractFormData);

		/*
		// find all child nodes that are possible form elements
		this.find("input, textarea, select").forEach(function(elem, i) {

			var name = elem.getProp('name'),
				type = elem.getProp('type'),
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
		});*/

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

Form._Input = View.partial("<input />").extend(function(type, name, value) {
	var input = this;

	this.defineAttr("type", type);

	this.defineAttr("name", name || "");

	this.listenTo("value", function(val) {
		this.view.setFormValue(val);
	});

	this.value = value || "";

	// automatically update values on change initiated by the user
	this.view.on("change", function(e) {
		input.value = this.getFormValue();

		input.emit("change", input.value);
	});

	return this;

});

Form.Input = View.partial("<fieldset></fieldset>").extend(function(type, name, label, value) {

	var set = this;

	this.type = type;
	this.name = name || "";
	this.value = value || "";
	this.label = label || "";

	this.input = new Form._Input(type, name, value);

	// remove the id listener for the fieldset, we want to pass it through to the input
	this.stopListeningTo('id');

	// set a unique id for this form element based on its Model's `__unique property`
	this.id = this.type + '_' + this.name + '_' + this.__unique;

	this.bind(this.input, [
		'type',
		'name',
		'value',
		'id'
	]);

	// pass through value changes from the input
	set.repeat(this.input, 'change');

	this.listenTo(type, function(type) {

		if(type === 'radio' || type === 'checkbox') {

			this.listenTo('selected', function(val) {

				this.input.view.setProp('checked', !!val);
			});

			this.input.on('change', function(val) {

				if(this.view.isSelected()) {
					// set the property directly so we don't wind up in an infinite loop
					set.__properties.selected = true;
				}
			});

			this.selected = false;
		} else {

			delete this.selected;
		}
	});

	this.labelView = new Form.Label(this.label, this.id);

	this.bind(this.labelView, {
		// if the `id` updates, update the label's `for` attribute so it's connected to the right form element
		id: 'for',
		// if the input's label attribute changes, we want that reflected in the text of the label
		label: 'text'
	});

	return this;

});

Form.Submit = Form._Input.partial("submit").extend(function(value) {
	this.value = value;

	return this;
});

Form.RadioButton = Form.Input.partial("radio");

Form.RadioButtons = View.partial("<fieldset></fieldset>").extend(function(name, values, value) {

	var set = this;

	(values || []).forEach(function(value) {
		set.addRadioButton(value);
	});

	// update all the radio buttons in this set to have the new name
	this.listenTo("name", function(name) {
		this.views.forEach(function(view) {
			view.name = name;
		});
	});

	this.name = name;

	// when the value is updated, select the right radio button
	this.listenTo("value", function(value) {
		this.views.forEach(function(button) {

			button.selected = button.value === value;
		});
	});

	// when a new radio button is selected, update the value
	this.views.on('change', function() {

		var value = "";

		set.views.forEach(function(button) {

			if(button.selected) {
				value = button.value;
			}
		});

		set.value = value;

		set.emit('change', set.value);
	});

	this.value = value || "";

	return this;
});

Form.RadioButtons.prototype.addRadioButton = function(value) {

	return this.push(new Form.RadioButton(this.name, value.label, value.value));
};

Form.Checkbox = Form.Input.partial("checkbox");

Form.Checkboxes = View.partial("<fieldset></fieldset>").extend(function(name, values, value) {

	var set = this;

	(values || []).forEach(function(value) {

		set.addCheckbox(value);
	});

	this.listenTo("name", function(name) {
		this.views.forEach(function(view) {
			view.name = name;
		});
	});

	this.name = name;

	// when the value is updated, select the right checkbox
	this.listenTo("value", function(values) {

		this.views.forEach(function(checkbox) {

			// values is an array of all the checked boxes
			checkbox.selected = !!~values.indexOf(checkbox.value);
		});
	});

	// when a new checkbox is selected, update the value
	this.views.on('change', function() {

		var values = [];

		set.views.forEach(function(checkbox) {

			if(checkbox.selected) {

				values.push(checkbox.value);
			}
		});

		set.value = values;

		set.emit('change', set.value);
	});

	this.value = value || [];

	return this;
});

Form.Checkboxes.prototype.addCheckbox = function(value) {

	return this.push(new Form.Checkbox(this.name, value.label, value.value));
};

Form.TextInput = Form.Input.partial("text");

Form.TextBox = View.partial("<textarea></textarea>").extend(function(name, label, value) {

	var set = this;

	this.name = name || "";
	this.value = value || "";
	this.label = label || "";

	this.textarea = new View("<textarea></textarea>");

	this.textarea.defineAttr("name", name);
	this.textarea.defineAttr("value", value);

	// automatically update values on change
	this.textarea.view.on("change", function(e) {
		set.textarea.value = this.getFormValue();

		set.textarea.emit("change", set.textarea.value);
	});

	// remove the id listener for the fieldset, we want to pass it through to the textarea
	this.stopListeningTo('id');

	// set a unique id for this form element based on its Model's `__unique property`
	this.id = this.type + '_' + this.name + '_' + this.__unique;

	this.bind(this.textarea, [
		'name',
		'value',
		'id'
	]);

	// pass through value changes from the textarea
	set.repeat(this.textarea, 'change');

	this.labelView = new Form.Label(this.label, this.id);

	this.bind(this.labelView, {
		// if the `id` updates, update the label's `for` attribute so it's connected to the right form element
		id: 'for',
		// if the textarea's label attribute changes, we want that reflected in the text of the label
		label: 'text'
	});

	return this;
});

Form.Select = View.partial("<select></select>").extend(function(name, label, options) {

	var set = this;

	this.name = name || "";
	this.value = value || "";
	this.label = label || "";
	this.options = this.views;

	this.select = new View("<select></select>");

	this.select.defineAttr("name", this.name);

	// automatically update values on change
	this.select.view.on("change", function(e) {
		set.select.value = this.getFormValue();

		set.select.emit("change", set.select.value);
	});

	// remove the id listener for the fieldset, we want to pass it through to the select
	this.stopListeningTo('id');

	// set a unique id for this form element based on its Model's `__unique property`
	this.id = this.type + '_' + this.name + '_' + this.__unique;

	this.bind(this.select, [
		'name',
		'value',
		'id'
	]);

	// pass through value changes from the select
	set.repeat(this.select, 'change');

	this.labelView = new Form.Label(this.label, this.id);

	this.bind(this.labelView, {
		// if the `id` updates, update the label's `for` attribute so it's connected to the right form element
		id: 'for',
		// if the select's label attribute changes, we want that reflected in the text of the label
		label: 'text'
	});

	this.addOptions(options || []);

	// when the value is updated, select the right option(s)
	this.listenTo("value", function(values) {

		this.select.views.forEach(function(option) {

			if(Array.isArray(values) && set.multiple) {

				// values is an array of all the selected options
				option.selected = !!~values.indexOf(option.value);

			} else {

				option.selected = values === option.value;
			}
		});
	});

	this.value = value || "";

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

Form.Select.Multiple = Form.Select.extend(function(name, options) {

	this.select.defineAttr("multiple", true);

	this.bind(this.select, 'multiple');

	this.multiple = true;

	return this;
});


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
Form.prototype.addRadioButtons = addGeneric(Form.RadioButtons);
Form.prototype.addCheckboxes = addGeneric(Form.Checkboxes);
Form.prototype.addTextInput = addGeneric(Form.TextInput);
Form.prototype.addTextBox = addGeneric(Form.TextBox);
Form.prototype.addSelect = addGeneric(Form.Select);

Form.elements = [
	Form.Submit,
	Form.RadioButtons,
	Form.Checkboxes,
	Form.TextInput,
	Form.TextBox,
	Form.Select
];

// add test methods to check if they are form elements
Form.prototype.isFormElement = function(view) {

	for(var i=0; i<Form.elements.length; i++) {

		if(view instanceof Form.elements[i]) {
			return true;
		}
	}

	return false;
};


module.exports = Form;