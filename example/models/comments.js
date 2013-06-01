/**
 * Dependencies
 */
var Bolt = require('../../lib');
var mixins = Bolt.mixins;

// Create the comments model
var commentsModel = new Bolt.Model({
	comments: []
});

commentsModel.mixin(mixins.REST.Collection('comments'));

commentsModel.compare = function(a, b) {
	return a.author === b.author && a.text === b.text;
};

module.exports = commentsModel;