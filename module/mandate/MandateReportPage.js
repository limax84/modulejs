/**
 * Class MandateReportPage.
 * 
 * @author Maxime Ollagnier
 */
MandateReportPage.inherits(Module);
function MandateReportPage() {
	var that = this;

	/** Inputs module */
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'value' : UserManager.user.referrer,
		'rootReferrer' : UserManager.user.referrer,
		'mandatory' : true,
		'onSelect' : function() {;
			that.loadMandateStatusReport();
		}
	});
	
	/** Result table module */
	this.mandateTable = new TableModule();
	this.mandateTable.id = 'mandateStatusReportTable';
	this.mandateTable.columnList.push(new Column('creditorName', I18n.get('creditor'), '28%', true));
	this.mandateTable.columnList.push(new Column('countCreated', I18n.get('MandateStatus.Created'), '12%', true));
	this.mandateTable.columnList.push(new Column('countCompliant', I18n.get('MandateStatus.WaitingSignature'), '12%', true));
	this.mandateTable.columnList.push(new Column('countValid', I18n.get('MandateStatus.Valid'), '12%', true));
	this.mandateTable.columnList.push(new Column('countRevoked', I18n.get('MandateStatus.Cancelled'), '12%', true));
	this.mandateTable.columnList.push(new Column('countSuspended', I18n.get('MandateStatus.Suspended'), '12%', true));
	this.mandateTable.columnList.push(new Column('countObsolete', I18n.get('MandateStatus.Obsolete'), '12%', true));
	this.mandateTable.pagerShow = true;
	this.mandateTable.pagerMax = 50;
	this.mandateTable.onClickPager = function() {
		that.loadMandateStatusReport();
	};
	this.inputReferrer.selectUniqueCreditor();
}

MandateReportPage.neededRoles = ["ROLE_USER", "VIEW_REPORTING"];

/**
 * TODO Comment
 */
MandateReportPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('report.mandate.status.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well row-fluid"></div>');
	jQ.append(form);
	
	var column1 = $('<div class="span3"></div>');
	var column2 = $('<div class="span6"></div>');
	column2.append(this.inputReferrer.buildJQ());
	var column3 = $('<div class="span3"></div>');
	form.append(column1).append(column2).append(column3);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.mandateTable.pagerStart = 0; that.loadMandateStatusReport(); });
	buttonRow.append(buttonSearch);
	
	var buttonExport = $('<div class="btn export">' + I18n.get('export') + '</div>');
	buttonExport.click(function() { that.getMandateStatusReportCSV(); });
	buttonRow.append(buttonExport);
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('report.mandate.status.list') + '</h4>'));
	jQ.append(result);
	if (this.mandateTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.mandateTable.buildJQ());
};

/**
 * TODO Comment
 */
MandateReportPage.prototype.loadMandateStatusReport = function() {
	if (!this.validate()) {
		return;
	}
	
	var that = this;
	AjaxManager.getJSON('getMandateStatusReport', {
		'referrerId' : this.inputReferrer.value.id,
		'start' : this.mandateTable.pagerStart,
		'size' : this.mandateTable.pagerMax
	}, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.mandateTable.pagerTotal = result.totalCount;
			that.mandateTable.objectMap = new Map();
			for (var i = 0; i < result.mandateStatusReports.length; i++) {
				that.mandateTable.objectMap.put(i, result.mandateStatusReports[i]);
			}
			that.mandateTable.buildJQ();
		}
	});
};

/**
 * TODO Comment
 */
MandateReportPage.prototype.getMandateStatusReportCSV = function() {
	if (!this.validate()) {
		return;
	}
	AjaxManager.download('getMandateStatusReportCSV', {
		'referrerId' : this.inputReferrer.value.id,
		'creditorName' : I18n.get('creditor'),
		'countCreated' : I18n.get('MandateStatus.Created'),
		'countCompliant' : I18n.get('MandateStatus.WaitingSignature'),
		'countValid' : I18n.get('MandateStatus.Valid'),
		'countRevoked' : I18n.get('MandateStatus.Cancelled'),
		'countSuspended' : I18n.get('MandateStatus.Suspended'),
		'countObsolete' : I18n.get('MandateStatus.Obsolete')
	});
};