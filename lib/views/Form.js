var View = require('../View');
var $ = View.$;

var Form = View.extend(function(action, method) {

	this.defineAttr("action");
	this.defineAttr("method");

	this.action = action || "";
	this.method = method || "GET";

	return this;

}, "<form></form>");

var Label = View.extend(function() {

	this.defineText();
	this.text = text;

	this.defineAttr("for");
	this['for'] = _for;

	return this;

}, "<label></label>");

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

var Input = View.extend(function(type, name, value) {

	this.defineAttr("type");
	this.type = type;

	this.defineAttr("name");
	this.name = name || "";

	this.defineAttr("value");
	this.value = value || "";
}, "<input />");

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


[Label, Submit, RadioButton, Checkbox, TextInput, Select].forEach(function(Name) {

	// create a prototype constructor for each element
	Form.prototype['add'+Name.name] = function() {
		var Constructor = function() {};
		Constructor.prototype = Name.prototype;

		var el = new Constructor();

		Name.apply(el, Array.prototype.slice.call(arguments));

		this.push(el);

		return el;
	};

	// provide access to the raw constructor on the Form function
	Form[Name.name] = Name;
});

module.exports = Form;