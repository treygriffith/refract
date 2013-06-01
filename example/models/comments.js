/**
 * Dependencies
 */
var Bolt = require('../../lib');

// Create the comments model
var commentsModel = new Bolt.Model({
	comments: []
});

// create an add method that adds a new comment to the collection
commentsModel.add = function(comment) {
	var comments = this.comments;

	comments.push(comment);

	return Bolt.http.post('/comments', comment).fail(function() {

		// remove the added comment on failure
		comments.forEach(function(c, i) {

			if(c.author === comment.author && c.text === comment.text) {

				comments.splice(i, 1);
			}
		});
	});
};

// Update the model with data from the server
commentsModel.fetch = function() {
	var model = this;

	Bolt.http.get('/comments').done(function(comments) {

		model.comments = comments;
	});
};

module.exports = commentsModel;