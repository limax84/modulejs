/**
 * Class Table Module.
 * 
 * @author Maxime Ollagnier
 * 
 * Usage :
 * 
 * var tableModule = new TableModule();
 * tableModule.columnList.push(new Column('attr1', I18n.get('col1.title'), '30%'));
 * tableModule.columnList.push(new Column('attr2', I18n.get('col2.title'), '40%'));
 * tableModule.columnList.push(new Column('attr3', I18n.get('col3.title'), '30%')));
 * tableModule.onClickTr = function(jQTr) {
 * 		...
 * };
 * tableModule.pagerShow = true;
 * tableModule.onClickPager = function() {
 * 		getJSON(uri, {'start' : tableModule.pagerStart, 'size' : tableModule.pagerMax}, function(result) {
 * 			tableModule.pagerTotal = result.size;
 * 			...
 * 		});
 * };
 * 
 * TODO add server-side sorting
 */
TableModule.inherits(Module);
function TableModule(params) {
	params = Util.getObject(params);
	
	this.setSelectable(params.selectable);
	this.setOnSelect(params.onSelect);
	this.setWithOddEven(params.withOddEven);
	
	/** Objects to display in the table mapped by id */
	this.objectMap = new Map();
	
	/** List of the columns */
	this.columnList = new List();
	
	/** Pagination attributes */
	this.pagerShow = false;
	this.pagerStart = 0;
	this.pagerStop = 0;
	this.pagerTotal = 0;
	this.pagerMax = TableModule.DEFAULT_PAGER_MAX;
	
	/** Sorting attributes */
	this.sortBy = '';
	this.sortDesc = TableModule.DEFAULT_SORT_DESC;
}

/** Default values */
TableModule.DEFAULT_SELECTABLE = false;
TableModule.DEFAULT_ON_SELECT = function(){};
TableModule.DEFAULT_PAGER_MAX = 0;
TableModule.DEFAULT_SORT_DESC = false;
TableModule.DEFAULT_WITHODDEVEN = true;

/**
 * Overrides the default getJQ method.
 * Calls the parent class (Module) getJQ method with 'table' as containing tag
 */
TableModule.prototype.getJQ = function() {
	return this.parentMethod(Module, 'getJQ', 'table');
};

/**
 * Fills the given jQ element
 * @param jQ
 */
TableModule.prototype.fillJQ = function(jQ) {

	var that = this;
	
	jQ.addClass('table').addClass('well');

	var colgroup = $('<colgroup></colgroup>');
	var tr = $('<tr></tr>');
	jQ.append(colgroup);
	jQ.append($('<thead></thead>').append(tr));
	this.columnList.foreach(function(index, column) {
		colgroup.append($('<col width="' + column.width + '" />'));
		var th = $('<th class="' + column.attr + '"></th>');
		if (Util.checkFunction(column.getTitle)) {
			th.append(column.getTitle());
		} else  {
			th.attr('title', column.title);
			th.append(column.title);
		}
		tr.append(th);
		if (column.sortable) {
			var icon = $('<i class="icon-chevron-up icon inactive">&nbsp;</i>');
			th.addClass('sortable').append(icon);
			th.click(function() { that.sort(column.attr, $(this)); });
			if (that.sortBy == column.attr) {
				th.addClass('sorted');
				icon.removeClass('inactive');
				if (that.sortDesc) {
					icon.removeClass('icon-chevron-up');
					icon.addClass('icon-chevron-down');
				}
			}
		}
	});
	
	var tbody = $('<tbody></tbody>');
	jQ.append(tbody);
	var i = 0;
	this.objectMap.foreach(function(id, object) {
		var tr = $('<tr id="' + id + '" class="' + (i++ % 2 == 0 ? 'even' : that.withOddEven ? 'odd' : '') + (that.selectedObject == object ? ' selected' : '') + '"></tr>');
		that.columnList.foreach(function(index, column) {
			var jQTd = column.getJQTd(object);
			if (column.clickable) {
				jQTd.click(function() {
					Util.getFunction(that.onClickTr).call(that, $(this).parent());
				});
			}
			tr.append(jQTd);
		});
		tbody.append(tr);
	});

	if (this.pagerShow) {
		jQ.append($('<tfoot></tfoot>').append(this.getJQPagerTr()));
	}
};

/**
 * Sets the selectable flag
 * 
 * @param selectable Boolean
 */
TableModule.prototype.setSelectable = function(selectable) {
	this.selectable = selectable;
	if (!Util.checkBool(selectable)) {
		this.selectable = TableModule.DEFAULT_SELECTABLE;
	}
};


/**
 * Sets the withOddEven flag
 * 
 * @param withOddEven Boolean
 */
TableModule.prototype.setWithOddEven = function(withOddEven) {
	this.withOddEven = withOddEven;
	if (!Util.checkBool(withOddEven)) {
		this.withOddEven = TableModule.DEFAULT_WITHODDEVEN;
	}
};

/**
 * Sets the onSelect function
 * @param onSelect Function
 */
TableModule.prototype.setOnSelect = function(onSelect) {
	this.onSelect = onSelect;
	if (!Util.checkFunction(onSelect)) {
		this.onSelect = TableModule.DEFAULT_ON_SELECT;
	}
};

/**
 * Callback of the click event on a TR whose jQ is given as parameter.
 * Can be redefined.
 * @param jQTr The jQ of the clicked TR
 */
TableModule.prototype.onClickTr = function(jQTr) {
	if (this.selectable) {
		if (jQTr.hasClass('selected')) {
			jQTr.removeClass('selected');
			this.selectedObject = undefined;
			Util.getFunction(this.onSelect)();
		} else {
			jQTr.siblings('tr.selected').removeClass('selected');
			jQTr.addClass('selected');
			this.selectedObject = this.objectMap.get(jQTr.attr('id'));
			Util.getFunction(this.onSelect)(jQTr.attr('id'));
		}
	} else {
		Util.getFunction(this.onSelect)(jQTr.attr('id'));
	}
};

/**
 * Unselects all TR and sets selectedObject to undefined
 */
TableModule.prototype.unselect = function() {
	this.getJQ().find('tr.selected').removeClass('selected');
	this.selectedObject = undefined;
	Util.getFunction(this.onSelect)();
};

/**
 * Generate and returns a TR element containing the pager activity.
 * Binds click events to backward/forward buttons. Each click will
 * update the pagination start/stop values and call the onClickPager method.
 * 
 * !! The update of the pagination total count number should be done manually !!
 */
TableModule.prototype.getJQPagerTr = function() {
	
	if (this.pagerStart == 0) {
		this.pagerStop = Math.min(this.pagerStart + this.pagerMax, this.pagerTotal);
	}
	
	var that = this;
	var trPager = $('<tr class="pagerTr"></tr>');
	var tdPager = $('<td class="pagerTd" colspan="' + this.columnList.size + '"></td>');
	trPager.append(tdPager);
	
	var backwardStart = $('<i class="click icon-step-backward icon inactive"/>');
	var backward = $('<i class="click icon-chevron-left icon inactive"/>');
	if (this.pagerStart > 0) {
		backwardStart.removeClass('inactive').click(function() {
			that.pagerStart = 0;
			that.pagerStop = Math.min(that.pagerMax, that.pagerTotal);
			that.onClickPager();
		});
		backward.removeClass('inactive').click(function() {
			that.pagerStart = Math.max(0, that.pagerStart - that.pagerMax);
			that.pagerStop = Math.min(that.pagerStart + that.pagerMax, that.pagerTotal);
			that.onClickPager();
		});
	}
	tdPager.append(backwardStart);
	tdPager.append(backward);
	
	tdPager.append($('<span class="text">' + Math.min(this.pagerStart + 1, this.pagerTotal) + ' - ' + this.pagerStop + ' / ' + this.pagerTotal + '</span>'));

	var forward = $('<i class="click icon-chevron-right icon inactive"/>');
	var forwardEnd = $('<i class="click icon-step-forward icon inactive"/>');
	if (this.pagerStop < this.pagerTotal) {
		forward.removeClass('inactive').click(function() {
			that.pagerStop = Math.min(that.pagerStop + that.pagerMax, that.pagerTotal);
			that.pagerStart = Math.max(0, that.pagerStop - that.pagerMax);
			that.onClickPager();
		});
		forwardEnd.removeClass('inactive').click(function() {
			that.pagerStop = that.pagerTotal;
			that.pagerStart = Math.max(0, that.pagerStop - that.pagerMax);
			that.onClickPager();
		});
	}
	tdPager.append(forward);
	tdPager.append(forwardEnd);
	
	return trPager;
};

/**
 * Callback of a click event on the pager
 * Can be redefined
 */
TableModule.prototype.onClickPager = function() {
};

/**
 * Client side sorting
 */
TableModule.prototype.sort = function(attr, jQTh) {
	if (this.sortBy == attr) {
		this.sortDesc = !this.sortDesc;
	} else {
		this.sortDesc = TableModule.DEFAULT_SORT_DESC;
	}
	
	if (Util.checkString(attr)) {
		this.sortBy = attr;
	}
	
	this.objectMap.sort(this.sortBy, this.sortDesc);
	this.buildJQ();
};

/**
 * Class Column. Represent a table column.
 * 
 * @author Maxime Ollagnier
 * 
 * @param attr Attribute name of the object to display in the cell
 * @param title Title of the column to be displayed
 * @param width The column width as css string
 * @param sortable The column can be sorted
 * @param useI18n The column uses I18n for its text and alt
 */
function Column(attr, title, width, sortable, useI18n) {
	this.attr = attr;
	this.title = title;
	this.width = width;
	this.sortable = sortable;
	this.useI18n = useI18n;
	this.clickable = true;
}

/**
 * Returns the column title. If not defined, the title attribute will be used.
 * Can be redefined.
 */
Column.prototype.getTitle = undefined;

/**
 * Returns the alt title value displayed as tooltip in the column TD for the specified object.
 * The object attribute displayed uses i18n if "useI18n" is set to true.
 * Can be redefined.
 * 
 * @param object The object of the row of the TD
 */
Column.prototype.getAlt = function(object) {
	return this.getText(object);
};

/**
 * Returns the text value displayed in the column TD for the specified object.
 * The object attribute displayed uses i18n if "useI18n" is set to true.
 * Can be redefined.
 * 
 * @param object The object of the row of the TD
 */
Column.prototype.getText = function(object) {
	var text = object[this.attr];
	if (this.useI18n) {
		text = I18n.get(object[this.attr]);
	}
	return text;
};

/**
 * Builds and returns the default jQ representation of a TD node.
 * Can be redefined.
 * 
 * @param object The object of the row of the TD
 */
Column.prototype.getJQTd = function(object) {
	var alt = '';
	if (Util.checkFunction(this.getAlt)) {
		alt = this.getAlt(object);
	}
	var tdJQ = $('<td class="' + this.attr + '"' + (Util.checkStringNotEmpty(alt) ? (' title="' + alt + '"') : '') + '></td>');
	tdJQ.append(this.getText(object));
	return tdJQ;
};


/**
 * Class SelectColumn. Represent a table column with checkboxes for row select.
 * 
 * @author Maxime Ollagnier
 */
SelectColumn.inherits(Column);
function SelectColumn(attr, width, tableModule) {
	this.parentConstructor(Column, attr, '', width, false, true);
	this.tableModule = tableModule;
	this.clickable = false;
}

SelectColumn.prototype.isSelectable = function(object) {
	return true;
};

SelectColumn.prototype.getAlt = function(object) {
	return I18n.get(this.attr, false);
};

SelectColumn.prototype.getText = function(object) {
	var that = this;
	var jQCheckbox = $('<input type="checkbox" />').change(function() {
		object[that.attr] = $(this).is(':checked');
	});
	if (object[this.attr] === true || object[this.attr] === 'true') {
		jQCheckbox.attr('checked', true);
	}
	if (this.isSelectable(object)) {
		object.selectable = true;
	} else {
		object.selectable = false;
		jQCheckbox.hide();
	}
	return jQCheckbox;
};

SelectColumn.prototype.getTitle = function() {
	var that = this;
	var jQTitle = $('<input type="checkbox" ' + (this.selected ? 'checked' : '') + '/>').change(function() {
		that.selected = $(this).is(':checked');
		that.setAll(that.selected);
	});
	return jQTitle;
};

SelectColumn.prototype.setAll = function(value) {
	var that = this;
	this.tableModule.objectMap.foreach(function(key, object) {
		object[that.attr] = value;
	});
	this.tableModule.buildJQ();
};

SelectColumn.prototype.getSelectedObjects = function() {
	var that = this;
	var selectedObjects = [];
	this.tableModule.objectMap.foreach(function(key, object) {
		if ((object[that.attr] === true || object[that.attr] === 'true') && object.selectable) {
			selectedObjects[selectedObjects.length] = object;
		}
	});
	return selectedObjects;
};
