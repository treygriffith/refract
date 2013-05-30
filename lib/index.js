var View = require('./View');

View.Table = require('./views/Table');
View.Form = require('./views/Form');
View.Text = require('./views/Text');
View.Link = require('./views/Link');
View.List = require('./views/List');

exports.View = View;

exports.http = {
	post: View.$.post,
	get: View.$.get,
	send: View.$.ajax
};


var Model = require('./Model');

exports.Model = Model;


var Controller = require('./Controller');

exports.Controller = Controller;