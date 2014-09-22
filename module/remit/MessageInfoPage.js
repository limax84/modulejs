/**
 * Class MessageInfoPage.
 * 
 * @author Maxime Ollagnier
 */
MessageInfoPage.inherits(Module);
function MessageInfoPage() {
	
	/** Inputs modules */
	this.inputStatus = new InputSelectModule({
		'label' : I18n.get('status'),
		'options' : EnumManager.MessageInfoStatus,
		'readonly' : true
	});
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'readonly' : true
	});
	this.inputCreationDate = new InputDateModule({
		'label' : I18n.get('date'),
		'readonly' : true
	});
	this.inputSource = new InputSelectModule({
		'label' : I18n.get('source'),
		'options' : EnumManager.OrderProducerType,
		'readonly' : true
	});
	this.inputAmount = new InputTextModule({
		'label' : I18n.get('amount'),
		'readonly' : true
	});
	this.inputSize = new InputTextModule({
		'label' : I18n.get('messageInfo.size'),
		'readonly' : true
	});
	
	/** Actions menu */
	this.actionMenu = new MenuModule({
		'id' : 'messageInfoActionMenu',
		'menuBarName' : 'messageInfoActionMenuBar',
		'title' : $('<span class="btn">' + I18n.get('actions') + '<i class="icon-chevron-down icon"/></span>'),
		'pullRight' : true,
		'openOnHover' : false
	});
	
	/** Payment info collapsible modules */
	this.paymentInfoCollapsibleModuleMap = {};
}

MessageInfoPage.neededRoles = function() {
	return ["ROLE_USER", "VIEW_REMIT"];
};

/**
 * Fills the specified jQ
 * @param jQ
 */
MessageInfoPage.prototype.fillJQ = function(jQ) {
	
	// Title
	jQ.append($('<h4>' + I18n.get('messageInfo') + ' - ' + this.messageInfo.identifier + '</h4>'));
	if (this.actionMenu.itemList.size > 0) {
		jQ.find('h4').append(this.actionMenu.buildJQ());
	}
	
	// Form
	var infoForm = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(infoForm);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputStatus.buildJQ());
	columnLeft.append(this.inputCreationDate.buildJQ());
	columnLeft.append(this.inputAmount.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputReferrer.buildJQ());
	columnRight.append(this.inputSource.buildJQ());
	columnRight.append(this.inputSize.buildJQ());
	infoForm.append(columnLeft).append(columnRight);
	
	// Payment info collapsible modules
	jQ.append($('<h4>' + this.messageInfo.size + ' ' + I18n.get('paymentInfos') + '</h4>'));
	$.each(this.paymentInfoCollapsibleModuleMap, function(paymentInfoId, paymentInfoCollapsibleModule) {
		jQ.append(paymentInfoCollapsibleModule.buildJQ());
	});
};


/**
 * Loads the messageInfo from server
 * @param callback
 */
MessageInfoPage.prototype.loadData = function(callback) {
	var that = this;
	this.messageInfo = undefined;
	AjaxManager.getJSON('getMessageInfo', {
		'messageInfoId' : this.parameters.id
	}, function(result) {
		if (result.success) {
			that.setMessageInfo(result.messageInfo);
		}
		Util.getFunction(callback)();
	});
};

/**
 * TODO Comment
 */
MessageInfoPage.prototype.setMessageInfo = function(messageInfo) {
    this.messageInfo = messageInfo;
    
    // Sets input fields
	this.inputReferrer.setValue(UserManager.getReferrer(this.messageInfo.creditorId));
	this.inputStatus.setValue(this.messageInfo.status);
	this.inputSource.setValue(this.messageInfo.source);
	this.inputAmount.setValue((this.messageInfo.amount / 100).format(2, ',') + '€');
	this.inputCreationDate.setValue(moment(this.messageInfo.creationDate).format('L'));
	this.inputSize.setValue(this.messageInfo.size + ' / ' + this.messageInfo.nbOrders);
	
	// Sets actions in action menu
	this.actionMenu.clearItems();
	if (this.messageInfo.status == 'W') {
		this.actionMenu.addItem(I18n.get('validate'), function() { that.validateMessageInfo(); });
	}
	if (this.messageInfo.status == 'V' || this.messageInfo.status == 'P') {
		this.actionMenu.addItem(I18n.get('messageInfo.downloadConfirmation'), function() { that.downloadMessageInfoConfirmation(); });
	}
	
	// Sets payment info collapsible modules
	var that = this;
	this.paymentInfoCollapsibleModuleMap = {};
	for (var i = 0; i < this.messageInfo.paymentInfos.length; i++) {
		
		// Payment info title
        var paymentInfo = this.messageInfo.paymentInfos[i];
		var paymentInfoTitle = $('<h5>');
		paymentInfoTitle.append($('<span class="dueDate">' + moment(paymentInfo.dueDate).format('L') + '</span>')).append(' - ');
		paymentInfoTitle.append($('<span class="sequenceType">' + I18n.get('SequenceType.' + paymentInfo.sequenceType) + '</span>')).append(' - ');
		paymentInfoTitle.append($('<span class="amount">' + (paymentInfo.amount / 100).format(2, ',') + '€</span>')).append(' - ');
		paymentInfoTitle.append($('<span class="size">' + paymentInfo.size + ' ' + I18n.get('orders') + '</span>')).append(' - (');
		paymentInfoTitle.append($('<span class="status">' + I18n.get('PaymentInfoStatus.' + paymentInfo.status) + '</span>)')).append(')');
		
		// Payment info collapsible module
		this.paymentInfoCollapsibleModuleMap[paymentInfo.id] = new CollapsibleModule({
			'title' : paymentInfoTitle,
			'showCollapsibleIcon' : 'prepend',
			'onUncollapse' : function(callback) { that.loadPaymentInfoOrders(paymentInfo.id, callback); }
		});
		
		// Payment info order table
		var orderTable = this.getOrderTable(paymentInfo.id);
		this.paymentInfoCollapsibleModuleMap[paymentInfo.id].orderTable = orderTable;
		this.paymentInfoCollapsibleModuleMap[paymentInfo.id].setContent(orderTable.getJQ());
	}
};

/**
 * TODO Comment
 */
MessageInfoPage.prototype.loadPaymentInfoOrders = function(paymentInfoId, callback) {
	var paymentInfoCollapsibleModule = this.paymentInfoCollapsibleModuleMap[paymentInfoId];
	var orderTable = paymentInfoCollapsibleModule.orderTable;
	AjaxManager.getJSON('getPaymentInfoOrders', {
		'paymentInfoId' : paymentInfoId,
		'start' : orderTable.pagerStart,
		'size' : orderTable.pagerMax
	}, function(result) {
		if (result.success) {
			orderTable.pagerTotal = result.totalCount;
			orderTable.objectMap = new Map();
			for (var i = 0; i < result.orders.length; i++) {
				orderTable.objectMap.put(result.orders[i].id, result.orders[i]);
			}
			orderTable.objectMap.sort('calculatedDueDate');
			orderTable.buildJQ();
		}
		Util.getFunction(callback)();
	});
};

/**
 * TODO Comment
 */
MessageInfoPage.prototype.validateMessageInfo = function() {
	var that = this;
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('confirmation'));
	PopupModule.getInstance().setContent(I18n.get('messageInfo.action.validate.confirmation'));
	PopupModule.getInstance().addButton(I18n.get('cancel'));
	PopupModule.getInstance().addButton('OK', function() {
		AjaxManager.getJSON('validateMessageInfo', {
			'messageInfoId' : that.messageInfo.id
		}, function(result) {
			if (result.success) {
				PopupModule.getInstance().clear();
				PopupModule.getInstance().setTitle(I18n.get('success'));
				PopupModule.getInstance().setContent(I18n.get('messageInfo.action.validate.success'));
				PopupModule.getInstance().addButton('OK');
				PopupModule.getInstance().show();
				that.reload();
			}
		});
	});
	PopupModule.getInstance().show();
};

/**
 * TODO Comment
 */
MessageInfoPage.prototype.downloadMessageInfoConfirmation = function() {
	AjaxManager.download('downloadMessageInfoConfirmation', {
		'messageInfoId' : this.messageInfo.id
	});
};

/**
 * TODO Comment
 */
MessageInfoPage.prototype.getOrderTable = function(paymentInfoId) {
	var that = this;
	
	// Order table
	var orderTable = new TableModule();
	orderTable.onClickTr = function(jQTr) {
		that.showOrder(jQTr.attr('id'));
	};
	
	// Calculated due date column
	var calculatedDueDateCol = new Column('calculatedDueDate', I18n.get('order.calculatedDueDate'), '12%');
	orderTable.columnList.push(calculatedDueDateCol);
	calculatedDueDateCol.getText = function(order) {
		return moment(order.calculatedDueDate).format('DD/MM/YYYY');
	};
	
	// Debtor column
	orderTable.columnList.push(new Column('debtorName', I18n.get('debtor'), '20%'));
	
	// Reason column
	orderTable.columnList.push(new Column('remittanceInfo', I18n.get('order.remittanceInfo'), '30%'));
	
	// Amount column
	var amountCol = new Column('amount', I18n.get('amount'), '11%');
	orderTable.columnList.push(amountCol);
	amountCol.getText = function(order) {
		return (order.amount / 100).format(2, ',') + '€';
	};
	
	// Status column
	var statusCol = new Column('status', I18n.get('status'), '14%', false, true);
	orderTable.columnList.push(statusCol);
	statusCol.getText = function(object) {
		return I18n.get('OrderStatus.' + object.status);
	};
	
	// RUM column
	orderTable.columnList.push(new Column('mandateRum', I18n.get('mandate.rum'), '13%'));
	
	// Pager
	orderTable.pagerShow = true;
	orderTable.pagerMax = 50;
	orderTable.onClickPager = function() { that.loadPaymentInfoOrders(paymentInfoId); };
	
	return orderTable;
};

/**
 * TODO Comment
 */
MessageInfoPage.prototype.showOrder = function(orderId) {
	this.orderModule = new OrderModule();
	this.orderModule.load({
		'orderId' : orderId
	}, function(jQOrderModule) {
		jQOrderModule.find('h4').remove();
		jQOrderModule.find('.btn-row').remove();
		PopupModule.getInstance().clear();
		PopupModule.getInstance().setTitle(I18n.get('order'));
		PopupModule.getInstance().addButton('OK');
		PopupModule.getInstance().setContent(jQOrderModule);
		PopupModule.getInstance().show();
	});
};