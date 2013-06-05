/**
 * Dependencies
 */
var extensions = require('../../').extensions;

// Create the comments model
var comments = new extensions.REST.Collection('comments', function(a, b) {
	return a.author === b.author && a.text === b.text;
});

module.exports = comments;