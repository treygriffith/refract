/**
 * Dependencies
 */
var markdown = require('markdown-js').markdown;
var Bolt = require('../../lib');
var View = Bolt.View;

var view = exports;

// Create a custom list item for comments that displays the comment body as markdown
var Comment = View.List.Item.extend(function(comment) {

	var authorView = this.push(new View.Text.Header(comment.author, 2));
	var textView = this.push(new View(markdown(comment.text)));

	this.author = comment.author;
	this.stopListeningTo("text"); // List items by default link the text property to the jQuery .text() method
	this.text = comment.text;

	/* Optional Dynamism in the comments (would only be used for editing comments)

	this.listenTo("author", function(author) {
		authorView.text = author;
	});

	this.listenTo("text", function(text) {
		textView = this.replaceView(textView, new View(markdown(text)));
	});

	*/

	return this;
});

// Create a container view
view.container = new View();

// Add a header to the comments
view.container.push(new View.Text.Header("Comments"));

// List to hold our comments (with list items as comments)
view.list = view.container.push(new View.List([], Comment));

// Submission Form
view.form = view.container.push(new View.Form());

var authorInput = view.form.addTextInput("author")
					.defineAttr("placeholder", "Your Name");

var textInput = view.form.addTextInput("text")
					.defineAttr("placeholder", "Say something...");

view.form.addSubmit("Add");

// Clear form on submission
view.form.on("submit", function() {

	authorInput.value = "";
	textInput.value = "";
});
