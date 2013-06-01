/**
 * Dependencies
 */
var Bolt = require('../../lib');

var commentsModel = require('../models/comments');
var commentsView = require('../views/comments');

// initialize the collection
commentsModel.fetch();

// bind changes in the model to the view
commentsModel.listenTo("comments", function(comments, new_comments, removed_comments) {

	// add new Items to the view when new comments are added to the model
	commentsView.list.addItems(new_comments);

	// remove comments that are no longer part of the model
	if(removed_comments) {
		commentsView.list.removeItems(removed_comments, function(a, b) {
			return a.author === b.author && a.text === b.text;
		});
	}

});

// create comments when the form is submitted
commentsView.form.on("submit", function(comment) {

	// notify the user on failure
	commentsModel.add(comment).fail(function() {
		alert("Comment failed to save!");
	});
});

// poll the server for new comments
setInterval(function() {
	commentsModel.fetch();
}, 5000);

// expose the view
exports.view = commentsView;