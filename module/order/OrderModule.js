/**
 * Class OrderModule.
 * 
 * @author Maxime Ollagnier
 */
OrderModule.inherits(Module);
function OrderModule() {
	
	/** Inputs modules */
	this.inputDueDate = new InputDateModule({
		'label' : I18n.get('order.dueDate'),
		'mandatory' : true
	});
	this.inputAmount = new InputTextModule({
		'label' : I18n.get('amount'),
		'placeholder' : I18n.get('amount'),
		'validationPattern' : ValidationPattern.VALID_AMOUNT,
		'mandatory' : true
	});
	this.inputAmount.afterJQ = function() {
		this.getJQ().addClass('input-append');
		this.getJQ().find('input').addClass('xlarge-input-append').after($('<span class="add-on">€</span>'));
	};
	this.inputRemittanceInfo = new InputTextModule({
		'label' : I18n.get('order.remittanceInfo'),
		'placeholder' : I18n.get('order.remittanceInfo'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true
	});
	this.inputStatus = new InputTextModule({
		'label' : I18n.get('status'),
		'readonly' : true
	});
	this.inputId = new InputTextModule({
		'label' : I18n.get('order.sepalia.id'),
		'readonly' : true
	});
	this.inputEndtoendId = new InputTextModule({
		'label' : I18n.get('order.endtoend.id'),
		'readonly' : true
	});
	this.inputSequenceType = new InputTextModule({
		'label' : I18n.get('order.sequence.type'),
		'readonly' : true
	});
	this.inputCalculatedRemitDate = new InputDateModule({
		'label' : I18n.get('order.remit.date'),
		'readonly' : true
	});
	this.inputRemitId = new InputTextModule({
		'label' : I18n.get('order.remit.id'),
		'readonly' : true
	});
	this.inputDebtorName = new InputTextModule({
		'label' : I18n.get('debtor'),
		'readonly' : true
	});
	this.inputMandateRum = new InputTextModule({
		'label' : I18n.get('mandate.rum'),
		'readonly' : true
	});
	this.inputMandateHasPendingAmendment = new InputTextModule({
		'label' : I18n.get('mandate.hasPendingAmendment'),
		'readonly' : true
	});
}

OrderModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"]; // TODO
};

/**
 * Fills the specified jQ
 * @param jQ
 */
OrderModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Checks if an order is selected or if a mandate is selected (for a new order)
	if (!Util.checkObject(this.order) && !Util.checkObject(this.mandate)) {
		console.error('Cannot create a new order without a mandate selected');
		return;
	}
	
	// Title
	if (Util.checkObject(this.order)) {
		jQ.append($('<h4>' + I18n.get('order') + '</h4>'));
	} else {
		jQ.append($('<h4>' + I18n.get('order.new') + '</h4>'));
	}
	
	// Transaction section
	jQ.append($('<h5>' + I18n.get('order.transaction') + '</h5>'));
	var transactionForm = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(transactionForm);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputAmount.buildJQ());
	columnLeft.append(this.inputDueDate.buildJQ());
	columnLeft.append(this.inputRemittanceInfo.buildJQ());
	transactionForm.append(columnLeft);
	
	if (Util.checkObject(this.order)) {
		var columnRight = $('<div class="span6"></div>');
		columnRight.append(this.inputId.buildJQ());
		columnRight.append(this.inputEndtoendId.buildJQ());
		columnRight.append(this.inputSequenceType.buildJQ());
		columnRight.append(this.inputStatus.buildJQ());
		transactionForm.append(columnRight);
		
		// Remit section
		jQ.append($('<h5>' + I18n.get('order.remit') + '</h5>'));
		var remitForm = $('<div class="form well cropbottom row-fluid"></div>');
		jQ.append(remitForm);
		
		var columnLeft = $('<div class="span6"></div>');
		columnLeft.append(this.inputCalculatedRemitDate.buildJQ());
		var columnRight = $('<div class="span6"></div>');
		columnRight.append(this.inputRemitId.buildJQ());
		remitForm.append(columnLeft).append(columnRight);
		
		// Mandate section
		var mandateTitle = $('<h5 class="mandateTitle">' + I18n.get('mandate') + ' <i class="icon-arrow-right icon"/></h5>');
		jQ.append(mandateTitle);
		
		mandateTitle.click(function() {
			PopupModule.getInstance().hide();
			NavigationManager.goTo('MandatePage?mandateRum=' + that.order.mandateRum + '&creditorId=' + that.order.creditorId);
		});
		
		var mandateForm = $('<div class="form well cropbottom row-fluid"></div>');
		jQ.append(mandateForm);
		
		var columnLeft = $('<div class="span6"></div>');
		columnLeft.append(this.inputDebtorName.buildJQ());
		columnLeft.append(this.inputMandateHasPendingAmendment.buildJQ());
		var columnRight = $('<div class="span6"></div>');
		columnRight.append(this.inputMandateRum.buildJQ());
		mandateForm.append(columnLeft).append(columnRight);
	}
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	jQ.append(buttonRow);

	if (this.isModifiable()) {
		var buttonSave = $('<div class="btn search">' + I18n.get('save') + '</div>');
		buttonSave.click(function() { that.saveOrder(); });
		buttonRow.append(buttonSave);
	}
};


/**
 * Loads the order from server if an order ID is found in the module's parameters or
 * loads the mandate from server if rum and creditor ID are given
 * @param callback
 */
OrderModule.prototype.loadData = function(callback) {
	var that = this;
	this.order = undefined;
	this.mandate = undefined;
	if (Util.checkString(this.parameters.orderId)) {
		AjaxManager.getJSON('getOrder', {
			'orderId' : this.parameters.orderId
		}, function(result) {
			if (result.success) {
				that.setOrder(result.order);
			}
			Util.getFunction(callback)();
		});
	} else if (Util.checkString(this.parameters.mandateRum) && Util.checkString(this.parameters.creditorId)) {
		AjaxManager.getJSON('getMandate', {
			'rum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId
		}, function(result) {
			if (result.success) {
				that.mandate = result.mandate;
			}
			Util.getFunction(callback)();
		});
	}
};

/**
 * TODO Comment
 */
OrderModule.prototype.setOrder = function(order) {
    this.order = order;
	this.inputDueDate.setValue(moment(order.calculatedDueDate));
	this.inputAmount.setValue((order.amount / 100).format(2, ','));
	this.inputRemittanceInfo.setValue(order.remittanceInfo);
	if (!this.isModifiable()) {
		this.inputDueDate.setReadonly(true);
		this.inputAmount.setReadonly(true);
		this.inputRemittanceInfo.setReadonly(true);
	}
	this.inputStatus.setValue(I18n.get('OrderStatus.' + order.status));
	this.inputId.setValue(order.id);
	this.inputEndtoendId.setValue(order.endtoendId);
	this.inputSequenceType.setValue(I18n.get('SequenceType.' + order.sequenceType));
	this.inputCalculatedRemitDate.setValue(moment(order.calculatedRemitDate));
	this.inputRemitId.setValue(order.remitId);
	this.inputDebtorName.setValue(order.debtorName);
	this.inputMandateRum.setValue(order.mandateRum);
	this.inputMandateHasPendingAmendment.setValue(I18n.get(order.mandateHasPendingAmendment.toString()));
};

/**
 * TODO Comment
 */
OrderModule.prototype.saveOrder = function() {
	var that = this;
	if (!this.validate()) {
		return false;
	}
	var params = {};
	params['amount'] = parseFloat(this.inputAmount.value.replace(/,/g, '.')) * 100;
	params['dueDate'] = moment(this.inputDueDate.value, 'DD/MM/YYYY').valueOf();
	params['remittanceInfo'] = this.inputRemittanceInfo.value;
	if (Util.checkObject(this.order)) {
		params['orderId'] = this.order.id;
	} else if (Util.checkObject(this.mandate)) {
		params['mandateRum'] = this.mandate.rum;
		params['creditorId'] = this.mandate.creditor.creditorId;
	}
	AjaxManager.getJSON('saveOrder', params, function(result) {
		if (result.success) {
			that.reload(function() {
			    alert(I18n.get('order.saved'));
			});
		}
	});
	return true;
};

/**
 * TODO Comment
 */
OrderModule.prototype.isModifiable = function() {
	return !Util.checkObject(this.order) || this.order.status == 'Created';
};