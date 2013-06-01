/**
 * Dependencies
 */
var markdown = require('markdown-js').markdown;
var Bolt = require('../../lib');
var View = Bolt.View;

// Create a container view
var commentBox = new View();

// Add a header to the comments
commentBox.push(new View.Text.Header("Comments"));

// Create a custom list item for comments that displays the comment body as markdown
var Comment = View.List.Item.extend(function(comment) {

	var item = this;

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
		textView = item.replaceView(textView, new View(markdown(text)));
	});

	*/

	return this;
});


// List to hold our comments (with list items as comments)
var commentList = commentBox.push(new View.List([], Comment));

// Submission Form
var commentForm = commentBox.push(new View.Form());

var authorInput = commentForm.addTextInput("author")
					.defineAttr("placeholder", "Your Name");

var textInput = commentForm.addTextInput("text")
					.defineAttr("placeholder", "Say something...");

commentForm.addSubmit("Add");

// Clear form on submission
commentForm.on("submit", function() {

	authorInput.value = "";
	textInput.value = "";
});

// expose form and list
commentBox.form = commentForm;
commentBox.list = commentList;


module.exports = commentBox;