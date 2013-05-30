var View = require('../View');
var $ = View.$;

var Form = View.extend(function(action, method) {

	var form = this;

	this.defineAttr("action");
	this.defineAttr("method");

	this.action = action || "";
	this.method = method || "GET";

	// add submission handler
	this.view.on("submit", function(e) {
		e.preventDefault();

		var data = {};

		$(this).find("input, textarea, select").each(function(i) {
			if($(this).attr('name')) {
				// record data
				data[$(this).attr('name')] = $(this).val();
			}
		});

		form.emit("submit", data);
	});

	// add change handler
	this.view.on("change", "input, textarea, select", function(e) {
		var data = {};
		if($(this).attr('name')) {
			data[$(this).attr('name')] = $(this).val();
		}

		form.emit("change", data);
	});

	return this;

}, "<form></form>");

var Label = View.extend(function() {

	this.defineText();
	this.text = text;

	this.defineAttr("for");
	this['for'] = _for;

	return this;

}, "<label></label>");

var Input = View.extend(function(type, name, value) {
	var input = this;

	this.defineAttr("type");
	this.type = type;

	this.defineAttr("name");
	this.name = name || "";

	this.defineAttr("value");
	this.value = value || "";

	this.listenTo("value", function(val, self) {
		self.view.val(val);
	});

	// automatically update values on change
	this.view.on("change", function(e) {

		input.value = $(this).val();

		input.emit("change", input.value);
	});

}, "<input />");

var Submit = Input.extend(function(value, name) {

	this.name = name;
	this.value = value;

}, "submit");

var RadioButton = Input.extend(function(name, value) {
	this.name = name;
	this.value = value;
}, "radio");

var Checkbox = Input.extend(function(name, value) {
	this.name = name;
	this.value = value;
}, "checkbox");

var TextInput = Input.extend(function(name, value) {
	this.name = name;
	this.value = value;
}, "text");

var Select = View.extend(function(name, options) {

	this.defineAttr("name");
	this.name = name;

	this.options = this.views;

	options = options || [];

	this.addOptions(options);

	return this;

}, "<select></select>");

Select.prototype.addOption = function(option) {
	return this.push(new Option(option));
};

Select.prototype.addOptions = function(options) {
	var select = this;

	options.forEach(function(option) {
		select.addOption(option);
	});
};

Select.prototype.clearOptions = function() {
	this.empty();
	return this.options;
};


var Option = View.extend(function(opt) {

	var name = opt;

	if(typeof opt === 'object') {

		name = opt.name;
	}

	this.defineAttr("value");
	if(opt.value) {
		this.value = opt.value;
	}

	this.defineAttr('selected');
	if(opt.selected) {
		this.selected = opt.selected;
	}

	this.defineText("name");
	this.name = name;

	return this;

}, "<option></option>");

function addGeneric(Name) {
	return function() {
		var Constructor = function() {};
		Constructor.prototype = Name.prototype;

		var el = new Constructor();

		Name.apply(el, [].slice.call(arguments));

		return this.push(el);
	};
}

// Expose constructors, and convenience push methods

Form.Label = Label;
Form.prototype.addLabel = addGeneric(Label);

Form.Submit = Submit;
Form.prototype.addSubmit = addGeneric(Submit);

Form.RadioButton = RadioButton;
Form.prototype.addRadioButton = addGeneric(RadioButton);

Form.Checkbox = Checkbox;
Form.prototype.addCheckbox = addGeneric(Checkbox);

Form.TextInput = TextInput;
Form.prototype.addTextInput = addGeneric(TextInput);

Form.Select = Select;
Form.prototype.addSelect = addGeneric(Select);


module.exports = Form;