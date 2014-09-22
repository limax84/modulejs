/**
 * Class OrderReportPage.
 * 
 * @author Maxime Ollagnier
 */
OrderReportPage.inherits(Module);
function OrderReportPage() {
	var that = this;

	/** Inputs module */
	this.inputBeginDate = new InputDateModule({
		'label' : I18n.get('begin.date'),
		'value' : moment().subtract('months', 1).startOf('day').format('L')
	});
	this.inputEndDate = new InputDateModule({
		'label' : I18n.get('end.date'),
		'value' : moment().endOf('day').format('L')
	});
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'value' : UserManager.user.referrer,
		'rootReferrer' : UserManager.user.referrer,
		'mandatory' : true,
		'onSelect' : function() {;
			that.loadOrderReport();
		}
	});
	
	/** Result table module */
	this.orderTable = new TableModule();
	this.orderTable.id = 'orderReport';
	this.orderTable.columnList.push(new Column('creditorName', I18n.get('creditor'), '28%', true));
	this.orderTable.columnList.push(new Column('sentOrderCount', I18n.get('report.order.sentOrderCount'), '12%', true));
	var sentOrderAmountColumn = new Column('sentOrderAmount', I18n.get('report.order.sentOrderAmount'), '12%', true);
	this.orderTable.columnList.push(sentOrderAmountColumn);
	sentOrderAmountColumn.getText = function(orderReport) {
		return (orderReport.sentOrderAmount / 100).format(2, ',') + '€';
	};
	this.orderTable.columnList.push(new Column('rejectedOrderCount', I18n.get('report.order.rejectedOrderCount'), '12%', true));
	var rejectedOrderAmountColumn = new Column('rejectedOrderAmount', I18n.get('report.order.rejectedOrderAmount'), '12%', true);
	this.orderTable.columnList.push(rejectedOrderAmountColumn);
	rejectedOrderAmountColumn.getText = function(orderReport) {
		return (orderReport.rejectedOrderAmount / 100).format(2, ',') + '€';
	};
	this.orderTable.columnList.push(new Column('unsentOrderCount', I18n.get('report.order.unsentOrderCount'), '12%', true));
	var unsentOrderAmountColumn = new Column('unsentOrderAmount', I18n.get('report.order.unsentOrderAmount'), '12%', true);
	this.orderTable.columnList.push(unsentOrderAmountColumn);
	unsentOrderAmountColumn.getText = function(orderReport) {
		return (orderReport.unsentOrderAmount / 100).format(2, ',') + '€';
	};
	this.orderTable.pagerShow = true;
	this.orderTable.pagerMax = 50;
	this.orderTable.onClickPager = function() {
		that.loadOrderReport();
	};
	this.inputReferrer.selectUniqueCreditor();
}

OrderReportPage.neededRoles = ["ROLE_USER", "VIEW_REPORTING"];

OrderReportPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('report.order.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well row-fluid"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputBeginDate.buildJQ());
	columnLeft.append(this.inputReferrer.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputEndDate.buildJQ());
	form.append(columnLeft).append(columnRight);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.orderTable.pagerStart = 0; that.loadOrderReport(); });
	buttonRow.append(buttonSearch);
	
	var buttonExport = $('<div class="btn export">' + I18n.get('export') + '</div>');
	buttonExport.click(function() { that.getOrderReportCSV(); });
	buttonRow.append(buttonExport);
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('report.order.list') + '</h4>'));
	jQ.append(result);
	if (this.orderTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.orderTable.buildJQ());
};

/**
 * TODO Comment
 */
OrderReportPage.prototype.loadOrderReport = function() {
	if (!this.validate()) {
		return;
	}
	
	var that = this;
	AjaxManager.getJSON('getOrderReport', {
		'referrerId' : this.inputReferrer.value.id,
		'beginDate' : moment(this.inputBeginDate.value, 'DD/MM/YYYY').valueOf(),
		'endDate' : moment(this.inputEndDate.value, 'DD/MM/YYYY').valueOf(),
		'start' : this.orderTable.pagerStart,
		'size' : this.orderTable.pagerMax
	}, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.orderTable.pagerTotal = result.totalCount;
			that.orderTable.objectMap = new Map();
			for (var i = 0; i < result.orderReports.length; i++) {
				that.orderTable.objectMap.put(i, result.orderReports[i]);
			}
			that.orderTable.buildJQ();
		}
	});
};

/**
 * TODO Comment
 */
OrderReportPage.prototype.getOrderReportCSV = function() {
	if (!this.validate()) {
		return;
	}
	AjaxManager.download('getOrderReportCSV', {
		'referrerId' : this.inputReferrer.value.id,
		'beginDate' : moment(this.inputBeginDate.value, 'DD/MM/YYYY').valueOf(),
		'endDate' : moment(this.inputEndDate.value, 'DD/MM/YYYY').valueOf(),
		'creditorName' : I18n.get('creditor'),
		'sentOrderCount' : I18n.get('report.order.sentOrderCount'),
		'sentOrderAmount' : I18n.get('report.order.sentOrderAmount'),
		'rejectedOrderCount' : I18n.get('report.order.rejectedOrderCount'),
		'rejectedOrderAmount' : I18n.get('report.order.rejectedOrderAmount'),
		'unsentOrderCount' : I18n.get('report.order.unsentOrderCount'),
		'unsentOrderAmount' : I18n.get('report.order.unsentOrderAmount')
	});
};