var markdown = require('markdown-js').markdown;
var Bolt = require('../../lib');
var View = Bolt.View;
var $ = Bolt.View.$;

var commentBox = new View();

// Add a header to the comments
commentBox.push(new View.Text.Header("Comments"));

// Our custom list item for comments
var Comment = View.List.Item.extend(function(comment) {

	var item = this;

	var authorView = this.push(new View.Text.Header(comment.author, 2));
	var textView = this.push(new View(markdown(comment.text)));

	/* Optional Dynamism in the comments (would only be used for editing)

	this.bind(authorView, "author", function(authorView, author) {
		authorView.text = author;
	});

	this.listenTo("text", function(text) {
		textView = item.replaceView(textView, new View(markdown(text)));
	});

	*/
	this.author = comment.author;
	this.stopListeningTo("text");
	this.text = comment.text;

	return this;
});


// List to hold our comments (with list items as comments)
var commentList = commentBox.push(new View.List([], Comment));

// Submission Form
var commentForm = commentBox.push(new View.Form());

var authorInput = commentForm.addTextInput("author");
authorInput.defineAttr("placeholder", "Your Name");

var textInput = commentForm.addTextInput("text");
textInput.defineAttr("placeholder", "Say something...");

commentForm.addSubmit("Add");

// Clear form on submission
commentForm.on("submit", function() {
	console.log("clearing form");
	console.log("authorInput", authorInput.value)
	console.log("textInput", textInput.value)
	authorInput.value = "";
	textInput.value = "";

});

window.authorInput = authorInput;
window.textInput = textInput;

// expose form and list
commentBox.form = commentForm;
commentBox.list = commentList;


module.exports = commentBox;