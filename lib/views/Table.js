var View = require('../View');

var Table = View.extend(function(data) {

	this.setData(data);

}, "<table></table>");


Table.prototype.setData = function(data) {

	this.data = data || [];

	var _rows = this._rows = [];
	var rows = this.rows = this.views;

	var _columns = this._columns = new View.Views();

	// make note of all the possible columns
	this.data.forEach(function(obj) {

		for(var key in obj) {

			if(obj.hasOwnProperty(key) && !~_columns.indexOf(key)) {

				_columns.push(key);
			}
		}
	});

	// make rows of all the data points
	this.data.forEach(function(obj) {

		var _row = [];

		_columns.forEach(function(key, i) {
			_row[i] = obj[key];
		});

		_rows.push(_row);

		rows.push(new TableRow(_row));
	});

	this.head = new TableRow(_columns);

	return this;
};

Table.prototype.update = function(data) {
	this.setData(data);

	return this.render();
};

Table.prototype.render = function() {
	var thead = new View.DOMBinding("<thead></thead>");
	thead.append(this.head.render());

	var tbody = new View.DOMBinding("<tbody></tbody>");

	this.rows.forEach(function(row) {
		tbody.append(row.render());
	});

	this.view.empty();

	this.view.append(thead).append(tbody);

	this.rendered = true;

	return this.view;
};

Table.prototype.addRowAt = function(data, position) {

	for(var p in data) {
		if(data.hasOwnProperty(p)) {

			// new column, we have to re-render the whole thing
			if(!~this._columns.indexOf(p)) {
				this.head.push(p);
			}
		}
	}

	var _row = [];

	this._columns.forEach(function(key, i) {
		_row[i] = data[key];
	});

	this._rows.splice(position, 0, _row);

	return this.addViewAt(new TableRow(_row), position);
};

Table.prototype.appendRow = function(data) {
	return this.addRowAt(data, this.rows.length);
};
Table.prototype.push = Table.prototype.appendRow;

Table.prototype.prependRow = function(data) {
	return this.addRowAt(data, 0);
};
Table.prototype.unshift = Table.prototype.prependRow;


Table.prototype.removeRowAt = function(position) {
	this._rows.splice(position, 1);

	return this.removeViewAt(position);
};

var TableRow = View.extend(function(cells) {

	this._cells = cells;

	this.cells = this.views = new View.Views(this._cells.map(function(cell) {
		return new TableCell(cell);
	}));

	return this;

}, "<tr></tr>");

TableRow.prototype.addCellAt = function(data, position) {
	this._cells.splice(position, 0, data);

	var cell = new TableCell(data);

	return this.addViewAt(cell, position);
};

TableRow.prototype.appendCell = function(data) {
	return this.addCellAt(data, this.cells.length);
};
TableRow.prototype.push = TableRow.prototype.appendCell;

TableRow.prototype.prependCell = function(data) {
	return this.addCellAt(data, 0);
};
TableRow.prototype.unshift = TableRow.prototype.prependCell;

TableRow.prototype.removeCellAt = function(position) {
	this._cells.splice(position, 1);

	return this.removeViewAt(position);
};

var TableCell = View.extend(function(data) {

	this.defineText("data");

	this.data = data;

	return this;

}, "<td></td>");

module.exports = Table;
