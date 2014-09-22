/**
 * Class OrdersModule.
 * 
 * @author Maxime Ollagnier
 */
OrdersModule.inherits(Module);
function OrdersModule() {
	
	var that = this;
	
	/** Inputs modules */
	this.inputDebtor = new InputTextModule({
		'label' : I18n.get('debtor'),
		'placeholder' : I18n.get('debtor.name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'onEnter' : function() { that.orderTable.pagerStart = 0; that.searchOrders(); }
	});
	this.inputRum = new InputTextModule({
		'label' : I18n.get('mandate.rum'),
		'placeholder' : I18n.get('mandate.rum'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'onEnter' : function() { that.orderTable.pagerStart = 0; that.searchOrders(); }
	});
	this.inputStartDate = new InputDateModule({
		'label' : I18n.get('order.start.date')
	});
	this.inputEndDate = new InputDateModule({
		'label' : I18n.get('order.end.date'),
		'value' : moment().add('years', 1).format('L')
	});
	this.selectStatus = new InputSelectModule({
		'label' : I18n.get('status'),
		'options' : EnumManager.OrderStatusGroup
	});
	this.selectSequenceType = new InputSelectModule({
		'label' : I18n.get('order.sequence.type'),
		'options' : EnumManager.SequenceType
	});
	this.inputAmount = new InputTextModule({
		'label' : I18n.get('amount'),
		'placeholder' : I18n.get('amount'),
		'validationPattern' : ValidationPattern.VALID_AMOUNT,
		'onEnter' : function() { that.orderTable.pagerStart = 0; that.searchOrders(); }
	});
	this.inputAmount.afterJQ = function() {
		this.getJQ().addClass('input-append');
		this.getJQ().find('input').addClass('xlarge-input-append').after($('<span class="add-on">€</span>'));
	};
	this.inputRemittanceInfo = new InputTextModule({
		'label' : I18n.get('order.remittanceInfo'),
		'placeholder' : I18n.get('order.remittanceInfo'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'onEnter' : function() { that.orderTable.pagerStart = 0; that.searchOrders(); }
	});
	this.selectSchedule = new InputSelectModule({
		'label' : I18n.get('schedule'),
		'options' : this.schedules,
		'defaultValue' : ''
	});
	this.selectCreditor = new InputReferrerModule({
		'label' : I18n.get('creditor')
	});
	
	/** Result order table */
	this.initOrderTable();
}

OrdersModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"]; // TODO
};

OrdersModule.prototype.isMandateAware = function() {
	return Util.checkString(this.parameters.mandateRum) && Util.checkString(this.parameters.creditorId);
};

/**
 * TODO Comment
 */
OrdersModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('order.search.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputStartDate.buildJQ());
	columnLeft.append(this.inputRum.buildJQ());
	columnLeft.append(this.inputAmount.buildJQ());
	columnLeft.append(this.inputRemittanceInfo.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputEndDate.buildJQ());
	columnRight.append(this.isMandateAware() ? '' : this.inputDebtor.buildJQ());
	columnRight.append(this.selectStatus.buildJQ());
	columnRight.append(this.selectSequenceType.buildJQ());
	columnRight.append(this.isMandateAware() ? this.selectSchedule.buildJQ() : this.selectCreditor.buildJQ());
	form.append($('<div class="row-fluid"></div>').append(columnLeft).append(columnRight));
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.orderTable.pagerStart = 0; that.searchOrders(); });
	buttonRow.append(buttonSearch);
	
	var buttonNewOrder = $('<div class="btn new">' + I18n.get('order.new') + '</div>');
	buttonNewOrder.click(function() { that.createNewOrder(); });
	buttonRow.append(buttonNewOrder);
	
	var buttonNewSchedule = $('<div class="btn new">' + I18n.get('schedule.new') + '</div>');
	buttonNewSchedule.click(function() { that.createNewSchedule(); });
	buttonRow.append(buttonNewSchedule);
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('order.search.list') + '<i class="icon-trash icon"/></h4>'));
	result.find('i.icon-trash').click(function() {
		PopupModule.getInstance().clear();
		PopupModule.getInstance().setTitle(I18n.get('confirmation'));
		PopupModule.getInstance().setContent(I18n.get('order.cancel.confirmation'));
		PopupModule.getInstance().addButton(I18n.get('no'));
		PopupModule.getInstance().addButton(I18n.get('yes'), function() {
			that.cancelOrders(that.selectCol.getSelectedObjects());
		});
		PopupModule.getInstance().show();
	});
	jQ.append(result);
	if (this.orderTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.orderTable.buildJQ());
};


/**
 * Loads the schedules from server if a mandate is attached to the module
 * @param callback
 */
OrdersModule.prototype.loadData = function(callback) {
	var that = this;
	if (this.isMandateAware()) {
		this.inputRum.setValue(this.parameters.mandateRum);
		this.inputRum.setReadonly(true);
		AjaxManager.getJSON('getSchedules', {
			'mandateRum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId
		}, function(result) {
			if (result.success) {
				that.selectSchedule.setOptions(result.schedules);
			}
			Util.getFunction(callback)();
		});
	} else {
		this.inputRum.setValue();
		this.inputRum.setReadonly(false);
		this.selectSchedule.setValue();
		Util.getFunction(callback)();
	}
};

/**
 * Initialization of the orders table
 */
OrdersModule.prototype.initOrderTable = function() {
	var that = this;
	
	// Order table
	this.orderTable = new TableModule();
	this.orderTable.id = 'orderTable';
	this.orderTable.onClickTr = function(jQTr) {
		that.editOrder(jQTr.attr('id'));
	};

	// Select column
	this.selectCol = new SelectColumn('select', '4%', this.orderTable);
	this.orderTable.columnList.push(this.selectCol);
	this.selectCol.isSelectable = function(order) {
		return (order.status == 'Created' || order.status == 'Suspended') && order.sequenceType != 'First';
	};
	
	// Calculated due date column
	var calculatedDueDateCol = new Column('calculatedDueDate', I18n.get('order.calculatedDueDate'), '10%');
	this.orderTable.columnList.push(calculatedDueDateCol);
	calculatedDueDateCol.getText = function(order) {
		return moment(order.calculatedDueDate).format('DD/MM/YYYY');
	};
	
	// Debtor column
	this.orderTable.columnList.push(new Column('debtorName', I18n.get('debtor'), '20%'));
	
	// Reason column
	this.orderTable.columnList.push(new Column('remittanceInfo', I18n.get('order.remittanceInfo'), '30%'));
	
	// Amount column
	var amountCol = new Column('amount', I18n.get('amount'), '11%');
	this.orderTable.columnList.push(amountCol);
	amountCol.getText = function(order) {
		return (order.amount / 100).format(2, ',') + '€';
	};
	
	// Status column
	var statusCol = new Column('status', I18n.get('status'), '13%', false, true);
	this.orderTable.columnList.push(statusCol);
	statusCol.getText = function(object) {
		return I18n.get('OrderStatus.' + object.status);
	};
	
	// RUM column
	this.orderTable.columnList.push(new Column('mandateRum', I18n.get('mandate.rum'), '12%'));
	
	// Pager
	this.orderTable.pagerShow = true;
	this.orderTable.pagerMax = 100;
	this.orderTable.onClickPager = function() { that.searchOrders(); };
};

/**
 * TODO Comment
 */
OrdersModule.prototype.searchOrders = function() {
	if (!this.validate()) {
		return;
	}
	var that = this;
	AjaxManager.getJSON('getOrders', {
		'debtorName' : this.inputDebtor.value,
		'mandateRum' : this.inputRum.value,
		'startDate' : moment(this.inputStartDate.value, 'DD/MM/YYYY').valueOf(),
		'endDate' : moment(this.inputEndDate.value, 'DD/MM/YYYY').valueOf(),
		'status' : this.selectStatus.value,
		'sequenceType' : this.selectSequenceType.value,
		'amount' : parseFloat(this.inputAmount.value) * 100,
		'remittanceInfo' : this.inputRemittanceInfo.value,
		'scheduleName' : this.selectSchedule.value,
		'referrerId' : Util.checkObject(this.selectCreditor.value) ? this.selectCreditor.value.id : '',
		'sortFieldName' : that.orderTable.sortBy,
		'ascending' : !that.orderTable.sortDesc,
		'start' : that.orderTable.pagerStart,
		'size' : that.orderTable.pagerMax
	}, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.orderTable.pagerTotal = result.totalCount;
			that.orderTable.objectMap = new Map();
			for (var i = 0; i < result.orders.length; i++) {
				that.orderTable.objectMap.put(result.orders[i].id, result.orders[i]);
			}
			that.orderTable.objectMap.sort('calculatedDueDate');
			that.orderTable.buildJQ();
		}
	});
};

/**
 * TODO Comment
 */
OrdersModule.prototype.createNewOrder = function() {
	var that = this;
	this.orderModule = new OrderModule();
	this.orderModule.load({
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId
	}, function(jQOrderModule) {
		jQOrderModule.find('h4').remove();
		jQOrderModule.find('.btn-row').remove();
		PopupModule.getInstance().clear();
		PopupModule.getInstance().setTitle(I18n.get('order.new'));
		PopupModule.getInstance().addButton(I18n.get('cancel'));
		PopupModule.getInstance().addButton(I18n.get('save'), function() {
			if (that.orderModule.saveOrder()) {
				PopupModule.getInstance().hide();
			}
		}, false);
		PopupModule.getInstance().setContent(jQOrderModule);
		PopupModule.getInstance().show();
	});
};

/**
 * TODO Comment
 */
OrdersModule.prototype.createNewSchedule = function() {
	var that = this;
	this.scheduleModule = new ScheduleModule();
	this.scheduleModule.load({
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId
	}, function(jQScheduleModule) {
		jQScheduleModule.find('h4').remove();
		jQScheduleModule.find('.btn-row').remove();
		PopupModule.getInstance().clear();
		PopupModule.getInstance().setTitle(I18n.get('schedule.new'));
		PopupModule.getInstance().addButton(I18n.get('cancel'));
		PopupModule.getInstance().addButton(I18n.get('save'), function() {
			if (that.scheduleModule.saveSchedule(function() {
				that.reload();
			})) {
				PopupModule.getInstance().hide();
			}
		}, false);
		PopupModule.getInstance().setContent(jQScheduleModule);
		PopupModule.getInstance().show();
	});
};

/**
 * TODO Comment
 */
OrdersModule.prototype.editOrder = function(orderId) {
	var that = this;
	this.orderModule = new OrderModule();
	this.orderModule.load({
		'orderId' : orderId
	}, function(jQOrderModule) {
		jQOrderModule.find('h4').remove();
		jQOrderModule.find('.btn-row').remove();
		PopupModule.getInstance().clear();
		PopupModule.getInstance().setTitle(I18n.get('order'));
		PopupModule.getInstance().addButton(I18n.get('cancel'));
		PopupModule.getInstance().addButton(I18n.get('save'), function() {
			if (that.orderModule.saveOrder()) {
				PopupModule.getInstance().hide();
			}
		}, false);
		PopupModule.getInstance().setContent(jQOrderModule);
		PopupModule.getInstance().show();
	});
};

/**
 * TODO Comment
 */
OrdersModule.prototype.cancelOrders = function(orders) {
	if (orders.length == 0) {
		this.searchOrders();
		return; 
	}
	var that = this;
	var order = orders.pop();
	this.cancelOrder(order, function() {
		that.cancelOrders(orders);
	});
};

/**
 * TODO Comment
 */
OrdersModule.prototype.cancelOrder = function(order, callback) {
	AjaxManager.getJSON('cancelOrder', {
		'orderId' : order.id
	}, function(result) {
		Util.getFunction(callback)();
	});
};