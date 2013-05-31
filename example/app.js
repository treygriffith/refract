/**
 * Dependencies
 */
var Bolt = require('../lib');

// Pull our controller in
var commentsController = require('./controllers/comments');

// attach the view to the body
Bolt.View.Body.push(commentsController.view);