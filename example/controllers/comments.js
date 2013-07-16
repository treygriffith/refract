/**
 * Dependencies
 */
var commentsModel = require('../models/comments');
var commentsView = require('../views/comments');

// bind changes in the model to the view

// add new Items to the view when new comments are added to the model
commentsModel.on('add', function(new_comments) {

	commentsView.list.push.apply(commentsView.list, new_comments);
});

// remove comments that are no longer part of the model
commentsModel.on('remove', function(removed_comments) {

	commentsView.list.removeItems(removed_comments, commentsModel.compare);
});

// initialize the collection
commentsModel.index();

// create comments when the form is submitted
commentsView.form.on('submit', function(comment) {

	// notify the user on failure
	commentsModel.create(comment).fail(function() {

		alert("Comment failed to save!");
	});
});

// poll the server for new comments
setInterval(function() {

	commentsModel.index();
}, 5000);

// expose the container view
exports.view = commentsView.container;

window.comments = commentsModel;