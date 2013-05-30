var Bolt = require('../../lib');


var commentsModel = new Bolt.Model({
	comments: []
});

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

commentsModel.fetch = function() {
	var model = this;

	Bolt.http.get('/comments').done(function(comments) {

		model.comments = comments;
	});
};

module.exports = commentsModel;