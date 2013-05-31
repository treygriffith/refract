var $ = require('jquery-joules');
var Model = require('./Model');
var utils = require('./utils');

// View is both a Model and a controller. It has a model of the way it's view should appear in the DOM.
// The View's view is the DOM. It also handles events from the DOM, and passes them off (therefore acting as its own controller)
var View = Model.extend(function(html) {

	var self = this;

	this.view = $(html || "<div></div>");
	this.views = [];
	this.rendered = false;

	// update rendered object when id is updated
	this.defineAttr("id");
	this.defineAttr("class");

	// update style when it's updated
	this.listenTo("style", function(style, self, changes) {

		self.view.css(changes);
	});
	// initialize style
	this.style = {};

	return this;
});

View.$ = $;

// Check  if this view is part of the DOM; if not, release it
View.prototype._active = function() {
	return this.active || $.contains(window.document.documentElement, this.view[0]);
};

View.prototype.defineAttr = function(name, val) {
	// update rendered object when attr is updated

	this.listenTo(name, function(new_val, self) {
		self.view.attr(name, new_val);
	});

	if(val !== undefined) {
		this[name] = val;
	}
};

View.prototype.defineText = function(name, text) {
	// update rendered object when text is updated
	var view = this;

	this.listenTo(name || "text", function(new_val, self) {
		if(new_val) {
			self.view.text(new_val);
		}
	});

	if(text !== undefined) {
		this[name || "text"] = text;
	}
};

// update styles without getting rid of existing ones that don't conflict
View.prototype.updateStyle = function(newStyles) {
	this.style = this.style || {};

	for(var prop in newStyles) {
		if(newStyles.hasOwnProperty(prop)) {
			this.style[prop] = newStyles[prop];
		}
	}

	// explicitly call the setter (not necessary, but it guarantees changes will be reflected immediately)
	this.style = this.style;

	return this.style;
};

View.prototype.render = function() {
	var view = this.view;
	var views = this.views || [];

	views.forEach(function(_view) {
		view.append(_view.render());
	});

	this.rendered = true;

	return this.view;
};

View.prototype.getViewAt = function(position) {
	return this.views[position];
};

View.prototype.getFirstView = function() {
	return this.getViewAt(0);
};
View.prototype.getLastView = function() {
	return this.getViewAt(this.views.length - 1);
};

View.prototype.addViewAt = function(view, position) {

	this.views.splice(position, 0, view);

	if(!this.rendered) {
		return view;
	}

	if(this.views[position - 1]) {
		this.views[position - 1].view.after(view.render());
	} else if(this.views[position + 1]) {
		this.views[position + 1].view.before(view.render());
	} else {
		this.view.append(view.render());
	}

	return view;
};

View.prototype.appendView = function(view) {
	return this.addViewAt(view, this.views.length);
};
View.prototype.push = View.prototype.appendView;

View.prototype.prependView = function(data) {
	return this.addViewAt(data, 0);
};
View.prototype.unshift = View.prototype.prependView;

View.prototype.replaceViewAt = function(view, position) {

	var old_view = this.getViewAt(position);

	if(old_view === view) {
		return old_view;
	}

	this.views.splice(position, 1, view);

	if(!this.rendered) {
		return view;
	}

	old_view.remove();

	if(this.views[position - 1]) {
		this.views[position - 1].view.after(view.render());
	} else if(this.views[position + 1]) {
		this.views[position + 1].view.before(view.render());
	} else {
		this.view.add(view.render());
	}

	return view;
};

View.prototype.removeViewAt = function(position) {
	var view = this.views.splice(position, 1);

	if(view[0] && view[0].view) {
		view[0].view.remove();
	}

	return view;
};

View.prototype.removeView = function(view) {

	return this.removeViewAt(this.getPositionOf(view));
};

View.prototype.getPositionOf = function(view) {
	for(var i = 0; i < this.views.length; i++) {
		if(this.views[i] === view) {
			return i;
		}
	}
};

View.prototype.replaceView = function(oldView, newView) {
	return this.replaceViewAt(newView, this.getPositionOf(oldView));
};

View.prototype.pop = function() {
	return this.removeViewAt(this.views.length - 1);
};

View.prototype.shift = function() {
	return this.removeViewAt(0);
};

View.prototype.empty = function() {
	this.views = [];
	this.view.empty();

	return this;
};

View.prototype.addLineBreakAt = function(position) {
	return this.addViewAt(new View("<br />"), position);
};

View.prototype.addLineBreak = function() {
	return this.push(new View("<br />"));
};

// Global body for the document
View.Body = new View(document.body);
View.Body.render();


module.exports = View;