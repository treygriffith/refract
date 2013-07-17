/**
 * Dependencies
 */
var markdown = require('markdown-js').markdown;
var View = require('../../').View;

// alias exports
var view = exports;

// Create a container view
view.container = new View();

view.container.style.fontFamily = 'Helvetica';

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

var authorInput = view.form.addTextInput("author", "Your Name");
authorInput.placeholder = "John Doe";
authorInput.style.display = authorInput.labelView.style.display = 'block';

var textInput = view.form.addTextBox("body", "Comment");
textInput.placeholder = "Say something...";
textInput.style.display = textInput.labelView.style.display = 'block';

view.form.addSubmit("Add");


// Clear form on submission
view.form.on("submit", function() {

	authorInput.value = "";
	textInput.value = "";
});
