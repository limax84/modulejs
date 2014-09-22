/**
 * Class MessageInfosPage.
 * 
 * @author Maxime Ollagnier
 */
MessageInfosPage.inherits(Module);
function MessageInfosPage() {
	
	/** Inputs modules */
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'value' : UserManager.user.referrer,
		'rootReferrer' : UserManager.user.referrer,
		'mandatory' : true
	});
	this.inputReferrer.selectUniqueCreditor();
	this.inputStatus = new InputSelectModule({
		'label' : I18n.get('status'),
		'options' : EnumManager.MessageInfoStatus
	});
	this.inputSource = new InputSelectModule({
		'label' : I18n.get('source'),
		'options' : EnumManager.OrderProducerType,
		'defaultValue' : ''
	});
	this.inputBeginDate = new InputDateModule({
		'label' : I18n.get('begin.date'),
		'value' : moment().subtract('months', 1).startOf('month').format('L') // Beginning of last month
	});
	this.inputEndDate = new InputDateModule({
		'label' : I18n.get('end.date'),
		'value' : moment().endOf('month').format('L') // End of current month
	});
	this.inputWithRejection = new InputCheckboxModule({
		'label' : I18n.get('messageInfo.withRejection')
	});
	
	/** Result table module */
	this.initMessageInfoTable();
}

MessageInfosPage.neededRoles = ["ROLE_USER", "VIEW_REMIT"];

MessageInfosPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('messageInfo.search.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well row-fluid"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputBeginDate.buildJQ());
	columnLeft.append(this.inputStatus.buildJQ());
	columnLeft.append(this.inputSource.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputEndDate.buildJQ());
	columnRight.append(this.inputReferrer.buildJQ());
	columnRight.append(this.inputWithRejection.buildJQ());
	form.append(columnLeft).append(columnRight);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.searchMessageInfos(); });
	buttonRow.append(buttonSearch);
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('messageInfo.search.list') + '</h4>'));
	if (this.messageInfoTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.messageInfoTable.buildJQ());
	jQ.append(result);
};

/**
 * TODO Comment
 */
MessageInfosPage.prototype.searchMessageInfos = function() {
	if (!this.validate()) {
		return;
	}
	var that = this;
	AjaxManager.getJSON('getMessageInfos', {
    	'referrerId' : this.inputReferrer.value.id,
    	'status' : this.inputStatus.value,
    	'orderProducerType' : this.inputSource.value,
    	'beginDate' : moment(this.inputBeginDate.value, 'DD/MM/YYYY').valueOf(),
    	'endDate' : moment(this.inputEndDate.value, 'DD/MM/YYYY').valueOf(),
    	'withRejection' : this.inputWithRejection.value,
    	'start' : this.messageInfoTable.pagerStart,
    	'size' : this.messageInfoTable.pagerMax
	    // Sorting parameters
		// 	'orderBy' : this.messageInfoTable.orderBy,
		// 	'orderAsc' : this.messageInfoTable.orderAsc,
	}, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.messageInfoTable.pagerTotal = result.size;
			that.messageInfoTable.objectMap = new Map();
			for (var i = 0; i < result.messageInfos.length; i++) {
				that.messageInfoTable.objectMap.put(result.messageInfos[i].id, result.messageInfos[i]);
			}
			that.messageInfoTable.buildJQ();
		}
	});
};

/**
 * Initialization of the message info table
 */
MessageInfosPage.prototype.initMessageInfoTable = function() {
	var that = this;
	
    // Message info Table
	this.messageInfoTable = new TableModule();
	this.messageInfoTable.id = 'messageInfoTable';
	this.messageInfoTable.onClickTr = function(jQTr) {
		NavigationManager.goTo('MessageInfoPage?id=' + jQTr.attr('id'));
	};
	
	// Creation date column
	var dateColumn = new Column('date', I18n.get('date'), '10%', true);
	this.messageInfoTable.columnList.push(dateColumn);
	dateColumn.getText = function(messageInfo) {
		return moment(messageInfo.creationDate).format('L');
	};
	
	// Identifier column
	this.messageInfoTable.columnList.push(new Column('identifier', I18n.get('identifier'), '30%', true));
	
	// Creditor name column
	var creditorColumn = new Column('creditor', I18n.get('creditor'), '15%');
	this.messageInfoTable.columnList.push(creditorColumn);
	creditorColumn.getText = function(messageInfo) {
		var creditor = UserManager.getReferrer(messageInfo.creditorId);
		if (Util.checkObject(creditor)) {
			return creditor.name;
		}
		return '';
	};
	
	// Size column : PaymentInfo nb / Order nb
	var sizeColumn = new Column('size', I18n.get('messageInfo.size'), '15%');
	this.messageInfoTable.columnList.push(sizeColumn);
	sizeColumn.getText = function(messageInfo) {
		return messageInfo.size + ' / ' + messageInfo.nbOrders;
	};
	
	// Amount column
	var amountColumn = new Column('amount', I18n.get('amount'), '9%');
	this.messageInfoTable.columnList.push(amountColumn);
	amountColumn.getText = function(messageInfo) {
		return (messageInfo.amount / 100).format(2, ',') + '€';
	};
	
	// Order source column
	var sourceCol = new Column('source', I18n.get('source'), '10%', false, true);
	this.messageInfoTable.columnList.push(sourceCol);
	sourceCol.getText = function(messageInfo) {
		return I18n.get('OrderProducerType.' + messageInfo.source);
	};
	
	// Status column
	var statusCol = new Column('status', I18n.get('status'), '11%', false, true);
	this.messageInfoTable.columnList.push(statusCol);
	statusCol.getText = function(messageInfo) {
		return I18n.get('MessageInfoStatus.' + messageInfo.status);
	};
	
	// Pager
	this.messageInfoTable.pagerShow = true;
	this.messageInfoTable.pagerMax = 10;
	this.messageInfoTable.onClickPager = function() { that.searchMessageInfos(); };
};