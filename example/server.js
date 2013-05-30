var express = require('express');
var joules = require('joules');
var fs = require('fs');

var app = express();

app.use(express.bodyParser());
app.use(express.static(__dirname + '/..'));
joules.hint(__dirname + '/..', function(err) {
	if(err) {
		throw err;
	}
});

app.get('/', function(req, res) {
	fs.readFile(__dirname + '/index.html', 'utf8', function(err, str) {

		res.type('html');
		res.send(str);

	});

});


// Application
var comments = [
	{ author: '@tgriff3 (Trey Griffith)', text: 'This is one comment' },
	{ author: 'BoltJS', text: 'This is *another* comment' }
];

app.get('/comments', function(req, res) {

	res.json(comments);
});

app.post('/comments', function(req, res) {

	if(req.body.author && req.body.text) {

		var comment = {
			author: req.body.author,
			text: req.body.text
		};

		comments.push(comment);

		res.json(comment);
	} else {
		res.send(400);
	}

});



app.listen(4040);
console.log("listening on 4040");