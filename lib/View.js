var Model = require('./Model');
var Collection = require('./Collection'); // use full filename to avoid conflict with views directory
var utils = require('./utils');
var DOMBinding = require('dombinding-jquery');

// View is both a Model and a controller. It has a model of the way it's view should appear in the DOM.
// The View's view is the DOM. It also handles events from the DOM, and passes them off (therefore acting as its own controller)
var View = Model.partial({}).extend(function(html) {

	var self = this;

	this.view = new View.DOMBinding(html || "<div></div>");
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

	// render views as they enter our views collection
	this.views.on('add', function(views) {

		if(self.rendered) {

			views.forEach(function(view) {

				var position = self.getPositionOf(view);

				if(~position) {

					if(self.getViewAt(position - 1)) {

						self.getViewAt(position - 1).view.siblingAfter(view.render());

					} else if(self.getViewAt(position + 1)) {

						self.getViewAt(position + 1).view.siblingBefore(view.render());

					} else {

						self.view.append(view.render());
					}
				}
			});
		}
	});

	// remove views from the DOM as they leave our views collection
	this.views.on('remove', function(views) {

		if(self.rendered) {

			views.forEach(function(view) {

				view.view.remove();
			});
		}
	});


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
	var view = this;

	name = name || 'text';

	// update rendered object when text is updated
	this.listenTo(name, function(new_val) {
		if(new_val) {
			this.view.setText(new_val);
		}
	});

	if(text !== undefined) {
		this[name] = text;
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

View.prototype.getPositionOf = function(view) {

	return this.views.indexOf(view);
};

View.prototype.addViewAt = function(view, position) {

	this.views.splice(position, 0, view);

	return view;
};

View.prototype.push = function() {

	var args = [].slice.call(arguments);

	this.views.push.apply(this.views, args);

	if(args.length > 1) {
		return args;
	}

	return args[0];
};

View.prototype.unshift = function(view) {

	var args = [].slice.call(arguments);

	this.views.unshift.apply(this.views, args);

	if(args.length > 1) {
		return args;
	}

	return args[0];
};

View.prototype.replaceViewAt = function(view, position) {

	var old_view = this.getViewAt(position);

	if(old_view === view) {
		return old_view;
	}

	this.views.splice(position, 1, view);

	return view;

};

View.prototype.replaceView = function(oldView, newView) {

	var index = this.getPositionOf(oldView);

	if(~index) {
		return this.replaceViewAt(newView, index);
	}

	return false;
};

View.prototype.removeViewAt = function(position) {

	var view = this.views.splice(position, 1);

	return view;
};

View.prototype.removeView = function(view) {

	var index = this.getPositionOf(view);

	if(~index) {
		return this.removeViewAt(index);
	}

	return false;
};

View.prototype.pop = function() {
	return this.views.pop();
};

View.prototype.shift = function() {
	return this.views.shift();
};

View.prototype.empty = function() {
	this.views.empty();

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