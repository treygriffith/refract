var Model = require('./Model');
var Collection = require('./Collection'); // use full filename to avoid conflict with views directory
var utils = require('./utils');
var DOMBinding = require('dombinding-jquery');

// View is both a Model and a controller. It has a model of the way it's view should appear in the DOM.
// The View's view is the DOM. It also handles events from the DOM, and passes them off (therefore acting as its own controller)
var View = Model.partial({}).extend(function(html) {

	var self = this;

	this.view = new DOMBinding(html || "<div></div>");
	this.views = new Collection('views');
	this.rendered = false;

	// update rendered object when id is updated
	this.defineAttr("id");
	this.defineAttr("class");

	// update DOM style when View's style is updated
	this.listenTo("style", function(style, changes) {

		this.view.setStyle(changes);
	});

	this.style = {};


	return this;
});

View.DOMBinding = DOMBinding;

// Check  if this view is part of the DOM; if not, release it
View.prototype._active = function() {
	return this.active || this.view.inDOM();
};

// Define an arbitrary attribute on a DOM element
View.prototype.defineAttr = function(name, val) {
	// update rendered object when attr is updated

	this.listenTo(name, function(new_val) {
		this.view.setAttr(name, new_val);
	});

	if(val !== undefined) {
		this[name] = val;
	}

	return this;
};

// Define a text property for the DOM element
View.prototype.defineText = function(name, text) {
	// update rendered object when text is updated
	var view = this;

	this.listenTo(name || "text", function(new_val) {
		if(new_val) {
			this.view.setText(new_val);
		}
	});

	if(text !== undefined) {
		this[name || "text"] = text;
	}

	return this;
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
		this.views[position - 1].view.siblingAfter(view.render());
	} else if(this.views[position + 1]) {
		this.views[position + 1].view.siblingBefore(view.render());
	} else {
		this.view.append(view.render());
	}

	return view;
};

View.prototype.appendViews = function(views) {

	var self = this;

	return views.map(function(view) {
		self.appendView(view);
	});
};

View.prototype.appendView = function(view) {

	if(Array.isArray(view)) {

		return this.appendViews(view);
	}

	if(arguments.length > 1) {

		return this.appendViews([].slice.call(arguments));
	}

	return this.addViewAt(view, this.views.length);
};
View.prototype.push = View.prototype.appendView;

View.prototype.prependViews = function(views) {

	var self = this;

	return views.map(function(view) {
		self.prependView(view);
	});
};

View.prototype.prependView = function(view) {

	if(Array.isArray(view)) {

		return this.prependViews(view);
	}

	if(arguments.length > 1) {

		return this.prependViews([].slice.call(arguments));
	}

	return this.addViewAt(view, 0);
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
		this.views[position - 1].view.siblingAfter(view.render());
	} else if(this.views[position + 1]) {
		this.views[position + 1].view.siblingBefore(view.render());
	} else {
		this.view.append(view.render());
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
	this.views.empty();
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
View.Body = new View();

DOMBinding.DOMReady(function() {

	// make the view body actually attached to the view body
	View.Body.view = new DOMBinding(document.body);

	// render to the screen
	View.Body.render();
});


module.exports = View;