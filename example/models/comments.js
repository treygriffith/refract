/**
 * Dependencies
 */
var REST = require('refract-rest');

// Create the comments model
var comments = new REST.Collection('comments', function(a, b) {
	return a.author === b.author && a.text === b.text;
});

module.exports = comments;