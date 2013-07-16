/**
 * Dependencies
 */
var markdown = require('markdown-js').markdown;
var View = require('../../').View;

// alias exports
var view = exports;

// Create a container view
view.container = new View();

// Add a header to the comments
view.container.push(new View.Text.Header("Comments"));

// List to hold our comments
// List item is customized for comments that display the comment body as markdown
view.list = view.container.push(new View.List([], View.List.Item.partial(undefined).extend(function(comment) {

	var authorView = this.push(new View.Text.Header("", 2));
	var textView = this.push(new View());

	this.bind(authorView, {
		author: 'text'
	});

	this.listenTo("body", function(body) {
		textView = this.replaceView(textView, new View(markdown(body)));
	});

	this.author = comment.author;
	this.body = comment.body;

	return this;
})));

// Submission Form
view.form = view.container.push(new View.Form());

var authorInput = view.form.addTextInput("author", "Your Name").defineAttr("placeholder", "John Doe");

var textInput = view.form.addTextInput("text", "Comment").defineAttr("placeholder", "Say something...");

view.form.addSubmit(undefined, "Add");

// Clear form on submission
view.form.on("submit", function() {

	authorInput.value = "";
	textInput.value = "";
});
