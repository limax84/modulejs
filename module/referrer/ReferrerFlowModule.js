/**
 * Class ReferrerFlowModule.
 * 
 * @author Maxime Ollagnier
 */
ReferrerFlowModule.inherits(Module);
function ReferrerFlowModule() {
	var that = this;
	
	this.referrer = undefined;
	this.inheritedMandateFlows = undefined;
	this.mandateFlows = undefined;
	this.mandateFlowTable = this.getMandateFlowTable();
	this.mandateFlow = undefined;
	this.availableCustomProperties = undefined;

	/** Mandate flow form */
	this.inputName = new InputTextModule({
		'label' : I18n.get('name'),
		'placeholder' : I18n.get('name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true,
		'onKeyUp' : function() { that.setJQFormTitle(); },
		'onEnter' : function() { that.saveMandateFlow(); }
	});
	this.inputCreatedStatus = new InputCheckboxModule({
		'label' : I18n.get('referrer.mandateFlow.createdStatus'),
		'onChange' : function() { that.setJQFormTitle(); },
		'widthClass' : 'input-mini'
	});
	this.inputWaitingSignatureStatus = new InputCheckboxModule({
		'label' : I18n.get('referrer.mandateFlow.waitingSignatureStatus'),
		'onChange' : function() { that.setJQFormTitle(); },
		'widthClass' : 'input-mini'
	});
	this.inputValues = new InputMultipleValueSelectModule({
		'label' : I18n.get('referrer.mandateFlow.mandatoryFields'),
		'inputLabel' : I18n.get('referrer.mandateFlow.addField'),
		'options' : $.extend(EnumManager.ConformityProperty, this.availableCustomProperties),
		'unique' : true,
		'onChange' : function() { that.setJQFormTitle(); },
		'getText' : function(value, object) {
			// If the object is a simple String (standard non SEPA mandatory field)
			if (Util.checkString(object)) {
				return I18n.get(value);
			}
			// If the object is a custom property
			return object.name;
		}
	});
	/** collapsible module for Mandate models */
	this.mandateModelCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('mandate.models') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'collapsed' : true,
		'effect' : 'slide'
	});
	this.mandateModels = new MandateModelModule();
}

ReferrerFlowModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// List title
	jQ.append($('<h5>' + I18n.get('referrer.mandateFlow.list') + '</h5>'));
	
	// New button
	var buttonNew = $('<div class="btn new">' + I18n.get('new') + ' <i class="icon-plus icon"/></div>');
	buttonNew.click(function() { that.newMandateFlow(); });
	jQ.find('h5:first').append(buttonNew);
	
	// Mandate flows table
	jQ.append(this.mandateFlowTable.buildJQ());
	
	// Mandate flow edition form
	this.jQForm = $('<div id="mandateFlowEditionForm"></div>').hide();
	jQ.append(this.jQForm);
	
	// Fills form with selected mandate flow
	if (Util.checkObject(this.mandateFlowTable.selectedObject)) {
		this.editMandateFlow(this.mandateFlowTable.selectedObject.id);
	}
};

/**
 * Fills the JQ representation of the mandate flow edition form
 */
ReferrerFlowModule.prototype.fillJQForm = function() {
	var that = this;
	
	// Form title
	this.setJQFormTitle();
	
	// Form
	var form = $('<div class="form well"></div>');
	this.jQForm.append(form);

	var row1 = $('<div class="row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputName.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	var checkboxRow = $('<div class="row-fluid"></div>');
	checkboxRow.append(this.inputCreatedStatus.buildJQ().addClass('span6'));
	checkboxRow.append(this.inputWaitingSignatureStatus.buildJQ().addClass('span6'));
	columnRight.append(checkboxRow);
	form.append(row1.append(columnLeft).append(columnRight));
	
	var row2 = $('<div class="row-fluid"></div>');
	var column = $('<div class="span12" style="min-height:0"></div>');
	column.append(this.inputValues.buildJQ());
	form.append(row2.append(column));
	
	// Mandate model module
	// TODO  Check rights
	this.mandateModels.setReadonly(Util.checkBoolTrue(this.mandateFlow.inherited));
	this.mandateModels.load({
		'mandateFlowId' : this.mandateFlow.id
	}, function(jQ) {
		if (jQ.data('module').mandateModelTable.objectMap.size > 0 || !that.mandateFlow.inherited) {
			that.mandateModelCollapsible.setContent(jQ);
			form.append(that.mandateModelCollapsible.buildJQ());
		}
	});
	
	// Buttons
	if (!this.mandateFlow.inherited) {
		var buttonRow = $('<div class="btn-row"></div>');
		form.append(buttonRow);
		
		var buttonSave = $('<div class="btn save">' + I18n.get('save') + '</div>');
		buttonSave.click(function() { that.saveMandateFlow(); });
		buttonRow.append(buttonSave);
	}
};

/**
 * Sets the mandate flow edition form title
 */
ReferrerFlowModule.prototype.setJQFormTitle = function() {
	var jQFormTitle = this.jQForm.children('h5:first');
	if (!Util.checkJQueryNotEmpty(jQFormTitle)) {
		jQFormTitle = $('<h5></h5>');
		this.jQForm.prepend(jQFormTitle);
	}
	jQFormTitle.clear();
	if (!Util.checkStringNotEmpty(this.mandateFlow.name)) {
		jQFormTitle.text(I18n.get('referrer.mandateFlow.new'));
	} else {
		jQFormTitle.text(I18n.get('referrer.mandateFlow'));
		if (this.mandateFlow.inherited) {
			jQFormTitle.addClass('inherited');
			jQFormTitle.append(' (' + I18n.get('referrer.mandateFlow.inherited') + ' - ' + I18n.get('readonly') + ')');
		}
		jQFormTitle.append(' - ' + this.mandateFlow.name);
	}
	if (this.isMandateFlowModified()) {
		jQFormTitle.addClass('modified');
		jQFormTitle.append(' *');
	} else {
		jQFormTitle.removeClass('modified');
	}
};

/**
 * Returns true if any modification of in the mandate flow edition form is pending
 */
ReferrerFlowModule.prototype.isMandateFlowModified = function() {
	return this.inputName.modified || this.inputCreatedStatus.modified || this.inputWaitingSignatureStatus.modified || this.inputValues.modified;
};

/**
 * Loads the referrer, its mandate flows and its inherited mandate flows
 */
ReferrerFlowModule.prototype.loadData = function(callback) {
	var that = this;
	
	// Sets the referrer
	this.referrer = this.parameters.referrer;
	
	// Resets the mandate flows table object map
	that.mandateFlowTable.objectMap = new Map();
	
	// Fetches the inherited mandate flows from server
	AjaxManager.getJSON("getInheritedMandateFlows", {
		'referrerId' : this.referrer.id
	}, function(result) {
		if (result.success) {
			// Saves the inherited mandate flows
			that.inheritedMandateFlows = result.inheritedMandateFlows;
			
			// Sets the inherited mandate flows
			$.each(that.inheritedMandateFlows, function(id, inheritedMandateFlow) {
				that.mandateFlowTable.objectMap.put(id, inheritedMandateFlow);
			});
		}
		// Fetches the mandate flows from server
		AjaxManager.getJSON("getMandateFlows", {
			'referrerId' : that.referrer.id
		}, function(result) {
			if (result.success) {
				// Saves the mandate flows
				that.mandateFlows = result.mandateFlows;
				
				// Sets the mandate flows
				$.each(that.mandateFlows, function(id, mandateFlow) {
					that.mandateFlowTable.objectMap.put(id, mandateFlow);
				});
			}
			// Fetches the available custom properties for the referrer from the server
			AjaxManager.getJSON("getAvailableCustomProperties", {
				'referrerId' : that.referrer.id
			}, function(result) {
				if (result.success) {
					// Saves the available custom properties
					that.availableCustomProperties = result.availableCustomProperties;
					
					// Sets the options of the mandatory properties select
					that.inputValues.setOptions($.extend(EnumManager.ConformityProperty, that.availableCustomProperties));
					
					// Sets the selected object of the mandate flow table
					if (Util.checkObject(that.mandateFlowTable.selectedObject)) {
						that.mandateFlowTable.selectedObject = that.mandateFlowTable.objectMap.get(that.mandateFlowTable.selectedObject.id);
					}
				}
				Util.getFunction(callback)();
			});
		});
	});
};

/**
 * Sets the edited mandate flow
 */
ReferrerFlowModule.prototype.setMandateFlow = function(mandateFlow) {
	mandateFlow = Util.getObject(mandateFlow);
	if (this.mandateFlow != mandateFlow) {
		this.mandateFlow = mandateFlow;
		if (Util.checkBoolTrue(this.mandateFlow.inherited)) {
			this.inputName.setReadonly(true);
			this.inputCreatedStatus.setReadonly(true);
			this.inputWaitingSignatureStatus.setReadonly(true);
			this.inputValues.setReadonly(true);
		} else {
			this.inputName.setReadonly(false);
			this.inputCreatedStatus.setReadonly(false);
			this.inputWaitingSignatureStatus.setReadonly(false);
			this.inputValues.setReadonly(false);
		}
		this.inputName.modified = false;
		this.inputCreatedStatus.modified = false;
		this.inputWaitingSignatureStatus.modified = false;
		this.inputValues.modified = false;
		
		this.inputName.setValue(this.mandateFlow.name);
		this.inputCreatedStatus.setValue(this.mandateFlow.createdStatus);
		this.inputWaitingSignatureStatus.setValue(this.mandateFlow.waitingSignatureStatus);
		if (Util.checkArray(this.mandateFlow.mandatoryProperties)) {
			this.inputValues.setValues(this.mandateFlow.mandatoryProperties.concat(this.mandateFlow.mandatoryCustomProperties));
		} else {
			this.inputValues.setValues();
		}
	}
};

/**
 * Edit a new mandate flow
 */
ReferrerFlowModule.prototype.newMandateFlow = function() {
	this.mandateFlowTable.unselect();
	this.setMandateFlow();
	this.jQForm.clear();
	this.fillJQForm();
	this.jQForm.show();
};

/**
 * Edit a mandate flow
 */
ReferrerFlowModule.prototype.editMandateFlow = function(mandateFlowId) {
	this.jQForm.clear();
	if (!Util.check(mandateFlowId)) {
		this.jQForm.hide();
		return;
	}
	var editedMandateFlow = this.mandateFlows[mandateFlowId];
	if (!Util.checkObject(editedMandateFlow)) {
		editedMandateFlow = this.inheritedMandateFlows[mandateFlowId];
	}
	this.setMandateFlow(editedMandateFlow);
	this.fillJQForm();
	this.jQForm.show();
};

/**
 * Deletes a mandate flow
 */
ReferrerFlowModule.prototype.deleteMandateFlow = function(mandateFlowId) {
	
	var that = this;
	AjaxManager.getJSON('deleteMandateFlow', {
		'id' : mandateFlowId
	}, function(result) {
		if (result.success) {
			delete that.mandateFlows[mandateFlowId];
			that.mandateFlowTable.unselect();
			that.reload();
		}
	});
	return true;
};

/**
 * Deletes a mandate flow
 */
ReferrerFlowModule.prototype.saveMandateFlow = function() {
	if(!this.validate()) {
		return;
	}
	
	var mandateFlow = {};
	mandateFlow.id = this.mandateFlow.id;
	mandateFlow.name = this.inputName.value;
	mandateFlow.referrerId = this.referrer.id;
	mandateFlow.createdStatus = this.inputCreatedStatus.value;
	mandateFlow.waitingSignatureStatus = this.inputWaitingSignatureStatus.value;
	mandateFlow.mandatoryProperties = [];
	mandateFlow.mandatoryCustomProperties = [];
	for (var i = 0; i < this.inputValues.values.length; i++) {
		if (Util.checkString(EnumManager.ConformityProperty[this.inputValues.values[i]])) {
			mandateFlow.mandatoryProperties.push(this.inputValues.values[i]);
		}
		else if (Util.checkObject(this.availableCustomProperties[this.inputValues.values[i]])) {
			mandateFlow.mandatoryCustomProperties.push(this.inputValues.values[i]);
		}
	}
	
	var that = this;
	AjaxManager.getJSON('saveMandateFlow', {
		'newMandateFlow' : JSON.stringify(mandateFlow)
	}, function(result) {
		if (result.success) {
			that.mandateFlows[result.mandateFlow.id] = result.mandateFlow;
			that.mandateFlowTable.selectedObject = result.mandateFlow;
			that.reload();
		}
	});
	return true;
};

/**
 * Initialization of the mandate flows table
 */
ReferrerFlowModule.prototype.getMandateFlowTable = function() {
	var that = this;
	
	// Mandate flows table
	var mandateFlowTable = new TableModule({
		'selectable' : true,
		'onSelect' : function(mandateFlowId) {
			that.editMandateFlow(mandateFlowId);
		}
	});
	mandateFlowTable.id = 'mandateFlowTable';
	
	// Name column
	var nameCol = new Column('name', I18n.get('name'), '50%');
	nameCol.getText = function(object) {
		return $('<span class="' + (object.inherited ? 'inherited' : '') + '">' + object.name + '</span>');
	};
	mandateFlowTable.columnList.push(nameCol);

	// Created mandate status column
	var createdStatusCol = new Column('createdStatus', I18n.get('referrer.mandateFlow.createdStatus'), '23%', false, true);
	createdStatusCol.clickable = false;
	createdStatusCol.getText = function(object) {
		return $('<input type="checkbox" disabled />').attr('checked', object.createdStatus);
	};
	mandateFlowTable.columnList.push(createdStatusCol);

	// WaitingSignature mandate status column
	var waitingSignatureStatusCol = new Column('waitingSignatureStatus', I18n.get('referrer.mandateFlow.waitingSignatureStatus'), '23%', false, true);
	waitingSignatureStatusCol.clickable = false;
	waitingSignatureStatusCol.getText = function(object) {
		return $('<input type="checkbox" disabled />').attr('checked', object.waitingSignatureStatus);
	};
	mandateFlowTable.columnList.push(waitingSignatureStatusCol);

	// Delete action column
	var deleteCol = new Column('delete', '', '4%', false, true);
	deleteCol.clickable = false;
	deleteCol.getText = function(object) {
		if (object.inherited) {
			return '';
		}
		return $('<i class="icon-remove icon" />').click(function() {
			that.deleteMandateFlow(object.id);
		});
	};
	mandateFlowTable.columnList.push(deleteCol);
	
	return mandateFlowTable;
};
