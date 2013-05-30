var Bolt = require('../lib');

var commentsController = require('./controllers/comments');

// attach the view to the body
Bolt.View.Body.push(commentsController.view);