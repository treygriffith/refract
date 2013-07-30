/**
 * Dependencies
 */
var comments = require('../models/comments');
var view = require('../views/comments');

// bind changes in the model to the view

// add new Items to the view when new comments are added to the model
comments.bind(view.list, {
	_comments: 'views'
});

window.list = view.list;

/*
comments.on('add', function(new_comments) {

	view.list.push.apply(view.list, new_comments);
});

// remove comments that are no longer part of the model
comments.on('remove', function(removed_comments) {

	view.list.removeItems(removed_comments, comments.compare);
});*/

// initialize the collection
comments.index();

// create comments when the form is submitted
view.form.on('submit', function(comment) {

	// notify the user on failure
	comments.create(comment).fail(function() {

		alert("Comment failed to save!");
	});
});

// poll the server for new comments
setInterval(function() {

	comments.index();
}, 5000);

// expose the container view
exports.view = view.container;

window.comments = comments;