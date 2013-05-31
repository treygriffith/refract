var Bolt = require('../../lib');

var commentsModel = require('../models/comments');

// initialize the collection
commentsModel.fetch();

var commentsView = require('../views/comments');

// bind changes in the model to the view
commentsModel.bind(commentsView.list, "comments", function(list, comments, new_comments, removed_comments) {

	list.addItems(new_comments);

	if(removed_comments) {
		list.removeItems(removed_comments, function(a, b) {
			return a.author === b.author && a.text === b.text;
		});
	}

});

// handle form submissions
commentsView.form.on("submit", function(comment) {

	commentsModel.add(comment).fail(function() {
		alert("Comment failed to save!");
	});
});

// set up polling
setInterval(function() {
	commentsModel.fetch();
}, 5000);

exports.view = commentsView;