/**
 * Dependencies
 */
var BoltREST = require('boltjs-rest');

// Create the comments model
var comments = new BoltREST.Collection('comments', function(a, b) {
	return a.author === b.author && a.text === b.text;
});

module.exports = comments;