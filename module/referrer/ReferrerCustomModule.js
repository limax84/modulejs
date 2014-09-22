/**
 * Class ReferrerCustomModule.
 * 
 * @author Maxime Ollagnier
 */
ReferrerCustomModule.inherits(Module);
function ReferrerCustomModule() {
	var that = this;
	
	this.referrer = undefined;
	this.inheritedCustomProperties = undefined;
	this.customPropertyTable = this.getCustomPropertyTable();
	this.customProperty = undefined;

	/** Custom property form */
	this.inputKey = new InputTextModule({
		'label' : I18n.get('identifier'),
		'placeholder' : I18n.get('identifier'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true,
		'onKeyUp' : function() { that.setJQFormTitle(); },
		'onEnter' : function() { that.saveCustomProperty(); }
	});
	this.inputName = new InputTextModule({
		'label' : I18n.get('label'),
		'placeholder' : I18n.get('label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true,
		'onKeyUp' : function() { that.setJQFormTitle(); },
		'onEnter' : function() { that.saveCustomProperty(); }
	});
	this.inputType = new InputSelectModule({
		'label' : I18n.get('type'),
		'options' : EnumManager.CustomPropertyType,
		'onChange' : function() {
			that.setJQFormTitle();
			if (that.inputType.value == 'CHOICE_LIST') {
				that.inputValues.show();
			} else {
				that.inputValues.hide();
			}
		}
	});
	this.inputDisplayed = new InputCheckboxModule({
		'label' : I18n.get('referrer.customProperty.displayed'),
		'onChange' : function() { that.setJQFormTitle(); }
	});
	this.inputIndexed = new InputCheckboxModule({
		'label' : I18n.get('referrer.customProperty.indexed'),
		'onChange' : function() { that.setJQFormTitle(); }
	});
	this.inputValues = new InputMultipleValueTextModule({
		'label' : I18n.get('values'),
		'placeholder' : I18n.get('value'),
		'onChange' : function() { that.setJQFormTitle(); },
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
}

ReferrerCustomModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// List title
	jQ.append($('<h5>' + I18n.get('referrer.customProperty.list') + '</h5>'));
	
	// New button
	var buttonNew = $('<div class="btn new">' + I18n.get('new') + ' <i class="icon-plus icon"/></div>');
	buttonNew.click(function() { that.newCustomProperty(); });
	jQ.find('h5:first').append(buttonNew);
	
	// Custom properties table
	jQ.append(this.customPropertyTable.buildJQ());
	
	// Custom property edition form
	this.jQForm = $('<div id="customPropertyEditionForm"></div>').hide();
	jQ.append(this.jQForm);
	
	// Fills form with selected custom property
	if (Util.checkObject(this.customPropertyTable.selectedObject)) {
		this.editCustomProperty(this.customPropertyTable.selectedObject.key);
	}
};

/**
 * Fills the JQ representation of the custom property edition form
 */
ReferrerCustomModule.prototype.fillJQForm = function() {
	var that = this;
	
	// Form title
	this.setJQFormTitle();
	
	// Form
	var form = $('<div class="form well"></div>');
	this.jQForm.append(form);

	var row1 = $('<div class="row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputKey.buildJQ());
	columnLeft.append(this.inputName.buildJQ());
	columnLeft.append(this.inputType.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputDisplayed.buildJQ());
	columnRight.append(this.inputIndexed.buildJQ());
	form.append(row1.append(columnLeft).append(columnRight));
	
	var row2 = $('<div class="row-fluid"></div>');
	var column = $('<div class="span12" style="min-height:0"></div>');
	column.append(this.inputValues.buildJQ());
	form.append(row2.append(column));
	if (this.inputType.value != 'CHOICE_LIST') {
		that.inputValues.hide();
	} else {
		that.inputValues.show();
	}
	
	// Buttons
	if (!this.customProperty.inherited) {
		var buttonRow = $('<div class="btn-row"></div>');
		form.append(buttonRow);
		
		var buttonSave = $('<div class="btn save">' + I18n.get('save') + '</div>');
		buttonSave.click(function() { that.saveCustomProperty(); });
		buttonRow.append(buttonSave);
	}
};

/**
 * Sets the custom property edition form title
 */
ReferrerCustomModule.prototype.setJQFormTitle = function() {
	var jQFormTitle = this.jQForm.children('h5:first');
	if (!Util.checkJQueryNotEmpty(jQFormTitle)) {
		jQFormTitle = $('<h5></h5>');
		this.jQForm.prepend(jQFormTitle);
	}
	jQFormTitle.clear();
	if (!Util.checkStringNotEmpty(this.customProperty.key)) {
		jQFormTitle.text(I18n.get('referrer.customProperty.new'));
	} else {
		jQFormTitle.text(I18n.get('referrer.customProperty'));
		if (this.customProperty.inherited) {
			jQFormTitle.addClass('inherited');
			jQFormTitle.append(' (' + I18n.get('referrer.customProperty.inherited') + ' - ' + I18n.get('readonly') + ')');
		}
		jQFormTitle.append(' - ' + this.customProperty.key);
	}
	if (this.isCustomPropertyModified()) {
		jQFormTitle.addClass('modified');
		jQFormTitle.append(' *');
	} else {
		jQFormTitle.removeClass('modified');
	}
};

/**
 * Returns true if any modification of in the custom property edition form is pending
 */
ReferrerCustomModule.prototype.isCustomPropertyModified = function() {
	return this.inputKey.modified || this.inputName.modified || this.inputType.modified || this.inputDisplayed.modified || this.inputIndexed.modified || this.inputValues.modified;
};

/**
 * Loads the referrer, its custom properties and its inherited custom properties
 */
ReferrerCustomModule.prototype.loadData = function(callback) {
	var that = this;
	
	// Sets the referrer
	this.referrer = this.parameters.referrer;
	
	// Fetches the inherited custom properties from server
	AjaxManager.getJSON("getInheritedCustomProperties", {
		'referrerId' : this.referrer.id
	}, function(result) {
		if (result.success) {
			// Saves the inherited custom properties
			that.inheritedCustomProperties = result.inheritedCustomProperties;
			
			// Resets the custom property table object map
			that.customPropertyTable.objectMap = new Map();
			
			// Sets the inherited custom properties
			$.each(that.inheritedCustomProperties, function(key, inheritedCustomProperty) {
				that.customPropertyTable.objectMap.put(key, inheritedCustomProperty);
			});
			
			// Sets the custom properties
			$.each(that.referrer.customProperties, function(key, customProperty) {
				that.customPropertyTable.objectMap.put(key, customProperty);
			});
		}
		Util.getFunction(callback)();
	});
};

/**
 * Sets the edited custom property
 */
ReferrerCustomModule.prototype.setCustomProperty = function(customProperty) {
	customProperty = Util.getObject(customProperty);
	if (this.customProperty != customProperty) {
		this.customProperty = customProperty;
		if (Util.checkBoolTrue(this.customProperty.inherited)) {
			this.inputKey.setReadonly(true);
			this.inputName.setReadonly(true);
			this.inputType.setReadonly(true);
			this.inputDisplayed.setReadonly(true);
			this.inputIndexed.setReadonly(true);
			this.inputValues.setReadonly(true);
		} else {
			this.inputKey.setReadonly(false);
			this.inputName.setReadonly(false);
			this.inputType.setReadonly(false);
			this.inputDisplayed.setReadonly(false);
			this.inputIndexed.setReadonly(false);
			this.inputValues.setReadonly(false);
		}
		this.inputKey.modified = false;
		this.inputName.modified = false;
		this.inputType.modified = false;
		this.inputDisplayed.modified = false;
		this.inputIndexed.modified = false;
		this.inputValues.modified = false;
		this.inputKey.setValue(this.customProperty.key);
		this.inputName.setValue(this.customProperty.name);
		this.inputType.setValue(this.customProperty.type);
		this.inputDisplayed.setValue(this.customProperty.displayed);
		this.inputIndexed.setValue(this.customProperty.indexed);
		this.inputValues.setValues(this.customProperty.values);
	}
};

/**
 * Edit a new custom property
 */
ReferrerCustomModule.prototype.newCustomProperty = function() {
	this.customPropertyTable.unselect();
	this.setCustomProperty();
	this.jQForm.clear();
	this.fillJQForm();
	this.jQForm.show();
};

/**
 * Edit a custom property
 */
ReferrerCustomModule.prototype.editCustomProperty = function(customPropertyKey) {
	this.jQForm.clear();
	if (!Util.checkStringNotEmpty(customPropertyKey)) {
		this.jQForm.hide();
		return;
	}
	var editedCustomProperty = this.referrer.customProperties[customPropertyKey];
	if (!Util.checkObject(editedCustomProperty)) {
		editedCustomProperty = this.inheritedCustomProperties[customPropertyKey];
	}
	this.setCustomProperty(editedCustomProperty);
	this.fillJQForm();
	this.jQForm.show();
};

/**
 * Deletes a custom property
 */
ReferrerCustomModule.prototype.deleteCustomProperty = function(customPropertyKey) {
	
	var that = this;
	AjaxManager.getJSON('removeCustomProperty', {
		'referrerId' : this.referrer.id,
		'oldKey' : customPropertyKey
	}, function(result) {
		if (result.success) {
			result.referrer.expanded = that.referrer.expanded;
			UserManager.setReferrer(result.referrer);
			that.customPropertyTable.unselect();
			that.load({
				'referrer' : result.referrer
			});
		}
	});
	return true;
};

/**
 * Deletes a custom property
 */
ReferrerCustomModule.prototype.saveCustomProperty = function() {
	if(!this.validate()) {
		return;
	}
	
	var customProperty = {};
	customProperty.key = this.inputKey.value;
	customProperty.name = this.inputName.value;
	customProperty.type = this.inputType.value;
	customProperty.displayed = this.inputDisplayed.value;
	customProperty.indexed = this.inputIndexed.value;
	customProperty.values = this.inputValues.values;
	
	var that = this;
	AjaxManager.getJSON('saveCustomProperty', {
		'referrerId' : this.referrer.id,
		'oldKey' : Util.checkString(this.customProperty.key) ? this.customProperty.key : '',
		'customProperty' : JSON.stringify(customProperty)
	}, function(result) {
		if (result.success) {
			result.referrer.expanded = that.referrer.expanded;
			UserManager.setReferrer(result.referrer);
			that.customPropertyTable.selectedObject = result.referrer.customProperties[customProperty.key];
			that.load({
				'referrer' : result.referrer
			});
		}
	});
	return true;
};

/**
 * Initialization of the custom properties table
 */
ReferrerCustomModule.prototype.getCustomPropertyTable = function() {
	var that = this;
	
	// Custom properties table
	var customPropertyTable = new TableModule({
		'selectable' : true,
		'onSelect' : function(customPropertyKey) {
			that.editCustomProperty(customPropertyKey);
		}
	});
	customPropertyTable.id = 'customPropertyTable';
	
	// Identifier column
	var keyCol = new Column('key', I18n.get('identifier'), '28%');
	keyCol.getText = function(object) {
		return $('<span class="' + (object.inherited ? 'inherited' : '') + '">' + object.key + '</span>');
	};
	customPropertyTable.columnList.push(keyCol);
	
	// Label column
	var nameCol = new Column('name', I18n.get('label'), '28%');
	nameCol.getText = function(object) {
		return $('<span class="' + (object.inherited ? 'inherited' : '') + '">' + object.name + '</span>');
	};
	customPropertyTable.columnList.push(nameCol);
	
	// Type column
	var typeCol = new Column('type', I18n.get('type'), '14%', false, true);
	typeCol.getAlt = undefined;
	typeCol.getText = function(object) {
		return $('<span class="' + (object.inherited ? 'inherited' : '') + '">' + I18n.get('CustomPropertyType.' + object.type) + '</span>');
	};
	customPropertyTable.columnList.push(typeCol);

	// PDF display column
	var displayedCol = new Column('displayed', I18n.get('referrer.customProperty.displayed'), '13%', false, true);
	displayedCol.clickable = false;
	displayedCol.getText = function(object) {
		return $('<input type="checkbox" disabled />').attr('checked', object.displayed);
	};
	customPropertyTable.columnList.push(displayedCol);

	// Indexation column
	var indexedCol = new Column('indexed', I18n.get('referrer.customProperty.indexed'), '13%', false, true);
	indexedCol.clickable = false;
	indexedCol.getText = function(object) {
		return $('<input type="checkbox" disabled />').attr('checked', object.indexed);
	};
	customPropertyTable.columnList.push(indexedCol);

	// Delete action column
	var deleteCol = new Column('delete', '', '4%', false, true);
	deleteCol.clickable = false;
	deleteCol.getText = function(object) {
		if (object.inherited) {
			return '';
		}
		return $('<i class="icon-remove icon" />').click(function() {
			that.deleteCustomProperty(object.key);
		});
	};
	customPropertyTable.columnList.push(deleteCol);
	
	return customPropertyTable;
};
