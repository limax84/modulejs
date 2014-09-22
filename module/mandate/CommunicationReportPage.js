/**
 * Class CommunicationReportPage.
 * 
 * @author Maxime Ollagnier
 */
CommunicationReportPage.inherits(Module);
function CommunicationReportPage() {
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
			that.loadCommunicationErrorReport();
		}
	});
	
	/** Result table module */
	this.communicationTable = new TableModule();
	this.communicationTable.id = 'communicationReport';
	var eventDateColumn = new Column('eventDate', I18n.get('report.communication.eventDate'), '12%', true);
	this.communicationTable.columnList.push(eventDateColumn);
	eventDateColumn.getText = function(communicationReport) {
		return moment(communicationReport.eventDateColumn).format('L');
	};
	this.communicationTable.columnList.push(new Column('user', I18n.get('report.communication.user'), '12%', true));
	var messageColumn = new Column('message', I18n.get('report.communication.message'), '12%', true);
	this.communicationTable.columnList.push(messageColumn);
	messageColumn.getText = function(communicationReport) {
		var message = communicationReport.messageKey;
		for (var i = 0; i < communicationReport.params.length; i++) {
			message += '; ' + communicationReport.params[i];
		}
		return message;
	};
	this.communicationTable.pagerShow = true;
	this.communicationTable.pagerMax = 50;
	this.communicationTable.onClickPager = function() {
		that.loadCommunicationErrorReport();
	};
	this.inputReferrer.selectUniqueCreditor();
}

CommunicationReportPage.neededRoles = ["ROLE_USER", "VIEW_REPORTING"];

CommunicationReportPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('report.communication.error.title') + '</h4>'));
	
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
	buttonSearch.click(function() { that.communicationTable.pagerStart = 0; that.loadCommunicationErrorReport(); });
	buttonRow.append(buttonSearch);
	
	var buttonExport = $('<div class="btn export">' + I18n.get('export') + '</div>');
	buttonExport.click(function() { that.getCommunicationErrorReportCSV(); });
	buttonRow.append(buttonExport);
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('report.communication.list') + '</h4>'));
	jQ.append(result);
	if (this.communicationTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.communicationTable.buildJQ());
};

/**
 * TODO Comment
 */
CommunicationReportPage.prototype.loadCommunicationErrorReport = function() {
	if (!this.validate()) {
		return;
	}
	
	var that = this;
	AjaxManager.getJSON('getCommunicationErrorReport', {
		'beginDate' : moment(this.inputBeginDate.value, 'DD/MM/YYYY').valueOf(),
		'endDate' : moment(this.inputEndDate.value, 'DD/MM/YYYY').valueOf(),
		'referrerId' : this.inputReferrer.value.id,
		'start' : this.communicationTable.pagerStart,
		'size' : this.communicationTable.pagerMax
	}, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.communicationTable.pagerTotal = result.totalCount;
			that.communicationTable.objectMap = new Map();
			for (var i = 0; i < result.communicationErrorReports.length; i++) {
				that.communicationTable.objectMap.put(i, result.communicationErrorReports[i]);
			}
			that.communicationTable.buildJQ();
		}
	});
};

/**
 * TODO Comment
 */
CommunicationReportPage.prototype.getCommunicationErrorReportCSV = function() {
	if (!this.validate()) {
		return;
	}
	AjaxManager.download('getCommunicationErrorReportCSV', {
		'referrerId' : this.inputReferrer.value.id,
		'beginDate' : moment(this.inputBeginDate.value, 'DD/MM/YYYY').valueOf(),
		'endDate' : moment(this.inputEndDate.value, 'DD/MM/YYYY').valueOf(),
		'creditorName' : I18n.get('creditor'),
		'eventDate' : I18n.get('report.communication.eventDate'),
		'user' : I18n.get('report.communication.user'),
		'message' : I18n.get('report.communication.message')
	});
};