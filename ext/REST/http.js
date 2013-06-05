var $ = require('jquery-joules');

exports.get = $.get;
exports.post = $.post;
exports.delete = function(url, params) {
	return this.send(url, {
		type: 'DELETE',
		data: params
	});
};
exports.send = $.ajax;