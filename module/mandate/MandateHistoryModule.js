/**
 * Class MandateHistoryModule.
 * 
 * @author Maxime Ollagnier
 */
MandateHistoryModule.inherits(Module);
function MandateHistoryModule() {
	var that = this;
	
	this.initAmendmentTable();
	this.initHistoryTable();
	this.initCommunicationTable();
	
	//*********************************************************************************
	// Amendment table
	this.amendmentsCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('amendments') + '</h5>'),
		'content' : this.amendmentTable.getJQ(),
		'showCollapsibleIcon' : 'prepend',
		'onUncollapse' : function(callback) { that.loadAmendments(callback); }
	});
	
	/** Input Modules for start date parameter */
	this.amendmentsCollapsible.inputDateStart = new InputDateModule({
		'label' : I18n.get('begin.date'),
		'placeholder' : I18n.get('begin.date'),
		'maxDate' : moment().add('days', 1),
		'value' : moment(),
		'onChange' : function(){
			var start = that.amendmentsCollapsible.inputDateStart.getMillis();
			that.amendmentsCollapsible.inputDateEnd.setMinDate(moment(start));
			if (Util.checkStringEmpty(that.amendmentsCollapsible.inputDateEnd.getValue())){
				that.amendmentsCollapsible.inputDateEnd.setValue(that.amendmentsCollapsible.inputDateEnd.maxDate);
			}
			that.amendmentsCollapsible.inputDateEnd.buildJQ();
		}
	});
	/** Input Modules for end date parameter */
	this.amendmentsCollapsible.inputDateEnd = new InputDateModule({
		'label' : I18n.get('end.date'),
		'placeholder' : I18n.get('end.date'),
		'minDate' : moment().add('days', 1),
		'maxDate' : moment().add('days', 1),
		'value' : moment().add('days', 1)
	});
	this.amendmentsCollapsible.searchButton = $('<button class="btn" style="margin-bottom:6px;">' + I18n.get('search') + '</button>');	
	
	//*****************************************************************************************
	//history table
	this.historyCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('history') + '</h5>'),
		'content' : this.historyTable.getJQ(),
		'showCollapsibleIcon' : 'prepend',
		'onUncollapse' : function(callback) { that.loadHistory(callback); }
	});
	/** Input Modules for start date parameter */
	this.historyCollapsible.inputDateStart = new InputDateModule({
		'label' : I18n.get('begin.date'),
		'placeholder' : I18n.get('begin.date'),
		'maxDate' : moment().add('days', 1),
		'value' : moment(),
		'onChange' : function(){
			var start = that.historyCollapsible.inputDateStart.getMillis();
			that.historyCollapsible.inputDateEnd.setMinDate(moment(start));
			if (Util.checkStringEmpty(that.historyCollapsible.inputDateEnd.getValue())){
				that.historyCollapsible.inputDateEnd.setValue(that.historyCollapsible.inputDateEnd.maxDate);
			}
			that.historyCollapsible.inputDateEnd.buildJQ();
		}
	});
	/** Input Modules for end date parameter */
	this.historyCollapsible.inputDateEnd = new InputDateModule({
		'label' : I18n.get('end.date'),
		'placeholder' : I18n.get('end.date'),
		'minDate' : moment().add('days', 1),
		'maxDate' : moment().add('days', 1),
		'value' : moment().add('days', 1)
	});
	this.historyCollapsible.searchButton = $('<button class="btn" style="margin-bottom:6px;">' + I18n.get('search') + '</button>');	
	
	//*************************************************************************************
	//communication table
	this.communicationsCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('communication') + '</h5>'),
		'content' : this.communicationTable.getJQ(),
		'showCollapsibleIcon' : 'prepend',
		'onUncollapse' : function(callback) { that.loadCommunications(callback); }
	});
	/** Input Modules for start date parameter */
	this.communicationsCollapsible.inputDateStart = new InputDateModule({
		'label' : I18n.get('begin.date'),
		'placeholder' : I18n.get('begin.date'),
		'maxDate' : moment().add('days', 1),
		'value' : moment(),
		'onChange' : function(){
			var start = that.communicationsCollapsible.inputDateStart.getMillis();
			that.communicationsCollapsible.inputDateEnd.setMinDate(moment(start));
			if (Util.checkStringEmpty(that.communicationsCollapsible.inputDateEnd.getValue())){
				that.communicationsCollapsible.inputDateEnd.setValue(that.communicationsCollapsible.inputDateEnd.maxDate);
			}
			that.communicationsCollapsible.inputDateEnd.buildJQ();
		}
	});
	/** Input Modules for end date parameter */
	this.communicationsCollapsible.inputDateEnd = new InputDateModule({
		'label' : I18n.get('end.date'),
		'placeholder' : I18n.get('end.date'),
		'minDate' : moment().add('days', 1),
		'maxDate' : moment().add('days', 1),
		'value' : moment().add('days', 1)
	});
	this.communicationsCollapsible.searchButton = $('<button class="btn" style="margin-bottom:6px;">' + I18n.get('search') + '</button>');
	
	//special default init for those dates, not set by default
	this.amendmentsCollapsible.inputDateStart.value = '';
	this.amendmentsCollapsible.inputDateEnd.value = '';
	this.historyCollapsible.inputDateStart.value = '';
	this.historyCollapsible.inputDateEnd.value = '';
	this.communicationsCollapsible.inputDateStart.value = '';
	this.communicationsCollapsible.inputDateEnd.value = '';
}

MandateHistoryModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"];
};

MandateHistoryModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	//Amendment table
	this.amendmentsCollapsible.searchButton.click(function() { that.loadAmendments(); });
	var jQamendmentsContent = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.amendmentsCollapsible.inputDateStart.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.amendmentsCollapsible.inputDateEnd.buildJQ());
	jQamendmentsContent.append(columnLeft).append(columnRight);
	jQamendmentsContent.append(this.amendmentsCollapsible.searchButton);
	jQamendmentsContent.append(this.amendmentTable.buildJQ());
	this.amendmentsCollapsible.setContent(jQamendmentsContent);
	jQ.append(this.amendmentsCollapsible.buildJQ());

	// History table
	this.historyCollapsible.searchButton.click(function() { that.loadHistory(); });
	var jQhistoryContent = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.historyCollapsible.inputDateStart.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.historyCollapsible.inputDateEnd.buildJQ());
	jQhistoryContent.append(columnLeft).append(columnRight);
	jQhistoryContent.append(this.historyCollapsible.searchButton);
	jQhistoryContent.append(this.historyTable.buildJQ());
	this.historyCollapsible.setContent(jQhistoryContent);
	jQ.append(this.historyCollapsible.buildJQ());
	
	// Communication table
	this.communicationsCollapsible.searchButton.click(function() { that.loadCommunications(); });
	var jQCommunicationContent = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.communicationsCollapsible.inputDateStart.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.communicationsCollapsible.inputDateEnd.buildJQ());
	jQCommunicationContent.append(columnLeft).append(columnRight);
	jQCommunicationContent.append(this.communicationsCollapsible.searchButton);
	jQCommunicationContent.append(this.communicationTable.buildJQ());
	this.communicationsCollapsible.setContent(jQCommunicationContent);
	jQ.append(this.communicationsCollapsible.buildJQ());
	
};

/** Not used anymore : data are loaded on demand using CollapsibleModule */
MandateHistoryModule.prototype.loadData = function(callback) {
	this.amendmentsLoaded = false;
	this.historyLoaded = false;
	this.communicationsLoaded = false;
	Util.getFunction(callback)();
};

/**
 * Loads the amendments data and rebuilds the amendment table
 */
MandateHistoryModule.prototype.loadAmendments = function(callback) {
	if (!Util.checkFunction(callback) || (Util.checkFunction(callback) && this.amendmentsLoaded == false)){
		var that = this;
		AjaxManager.getJSON('getAmendments', {
			'startDate' : this.amendmentsCollapsible.inputDateStart.getMillis(),
			'endDate' : this.amendmentsCollapsible.inputDateEnd.getMillis(),
			'mandateRum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId
		}, function(result) {
			if (result.success) {
				if (result.amendments.length == 0){
					if (!Util.checkFunction(callback)){
						PopupModule.getInstance().show({
							'title' : I18n.get('mandate.history.noResultT'),
							'content' : I18n.get('mandate.history.noResult'),
							'button0' : { 'text' : 'OK' }
						});
					}
				} else {
					that.amendmentTable.objectMap = new Map();
					for (var i = 0; i < result.amendments.length; i++) {
						that.amendmentTable.objectMap.put(that.amendmentTable.objectMap.size, result.amendments[i]);
					}
					that.amendmentTable.objectMap.sort('date', true);
					that.amendmentTable.buildJQ();
				}
			} else {
				console.error('Failed to load mandate amendments [rum=' + mandateRum + ']');
			}
			Util.getFunction(callback)();
		});
		this.amendmentsLoaded = true;
	} else {
		Util.getFunction(callback)();
	}
};

/**
 * Loads the history data and rebuilds the history table
 */
MandateHistoryModule.prototype.loadHistory = function(callback) {
	if (!Util.checkFunction(callback) || (Util.checkFunction(callback) && this.historyLoaded == false)){
		var that = this;
		AjaxManager.getJSON('getHistory', {
			'startDate' : this.historyCollapsible.inputDateStart.getMillis(),
			'endDate' : this.historyCollapsible.inputDateEnd.getMillis(),
			'mandateRum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId
		}, function(result) {
			if (result.success) {
				if (result.revisions.length == 0){
					if (!Util.checkFunction(callback)){
						PopupModule.getInstance().show({
							'title' : I18n.get('mandate.history.noResultT'),
							'content' : I18n.get('mandate.history.noResult'),
							'button0' : { 'text' : 'OK' }
						});
					}
				} else {
					that.historyTable.objectMap = new Map();
					for (var i = 0; i < result.revisions.length; i++) {
						that.historyTable.objectMap.put(that.historyTable.objectMap.size, result.revisions[i]);
					}
					that.historyTable.objectMap.sort('date', true);
					that.historyTable.buildJQ();
				}
			} else {
				console.error('Failed to load mandate history [rum=' + mandateRum + ']');
			}
			Util.getFunction(callback)();
		});
		this.historyLoaded = true;
	} else {
		Util.getFunction(callback)();
	}
};

/**
 * Loads the communications data and rebuilds the communication table
 */
MandateHistoryModule.prototype.loadCommunications = function(callback) {
	if (!Util.checkFunction(callback) || (Util.checkFunction(callback) && this.communicationsLoaded == false)){
		var that = this;
		AjaxManager.getJSON('getCommunicationHistory', {
			'startDate' : this.communicationsCollapsible.inputDateStart.getMillis(),
			'endDate' : this.communicationsCollapsible.inputDateEnd.getMillis(),
			'mandateRum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId
		}, function(result) {
			if (result.success) {
				if (result.communicationEvents.length == 0){
					if (!Util.checkFunction(callback)){
						PopupModule.getInstance().show({
							'title' : I18n.get('mandate.history.noResultT'),
							'content' : I18n.get('mandate.history.noResult'),
							'button0' : { 'text' : 'OK' }
						});
					}
				} else {
					that.communicationTable.objectMap = new Map();
					for (var i = 0; i < result.communicationEvents.length; i++) {
						that.communicationTable.objectMap.put(that.communicationTable.objectMap.size, result.communicationEvents[i]);
					}
					that.communicationTable.objectMap.sort('date', true);
					that.communicationTable.buildJQ();
				}
			} else {
				console.error('Failed to load mandate communications [rum=' + mandateRum + ']');
			}
			Util.getFunction(callback)();
		});
		this.communicationsLoaded = true;
	} else {
		Util.getFunction(callback)();
	}
};

/**
 * Initialization of the amendment table
 */
MandateHistoryModule.prototype.initAmendmentTable = function() {

	// Amendment table declaration
	this.amendmentTable = new TableModule();
	this.amendmentTable.id = 'amendmentTable';
	
	// Date column definition. Defines special text generation for the column
	var dateCol = new Column('date', I18n.get('date'), '25%', true);
	this.amendmentTable.columnList.push(dateCol);
	dateCol.getText = function(object) {
		return moment(object.date).format('DD/MM/YY HH:mm:ss');
	};
	
	// Other columns definitions
	var changesCol = new Column('changes', I18n.get('changes'), '75%');
	this.amendmentTable.columnList.push(changesCol);
	changesCol.getText = function(object) {
		var text = '';
		if (object.changes.length == 0){
			return '';
		}
		text = I18n.get(object.changes[0]);
		for (var i=1; i<object.changes.length; i++){
			text += ', ' + I18n.get(object.changes[i]);
		}
		return text;
	};
	/*this.amendmentTable.columnList.push(new Column('oldRum', I18n.get('oldRum'), '15%'));
	this.amendmentTable.columnList.push(new Column('oldBic', I18n.get('oldBic'), '15%'));
	this.amendmentTable.columnList.push(new Column('oldIban', I18n.get('oldIban'), '15%'));
	this.amendmentTable.columnList.push(new Column('oldCredName', I18n.get('oldCredName'), '12.5%'));
	this.amendmentTable.columnList.push(new Column('oldCredComName', I18n.get('oldCredComName'), '12.5%'));
	this.amendmentTable.columnList.push(new Column('oldICS', I18n.get('oldICS'), '15%'));*/
};

/**
 * Initialization of the history table
 */
MandateHistoryModule.prototype.initHistoryTable = function() {
	var that = this;

	// History table declaration
	this.historyTable = new TableModule();
	this.historyTable.id = 'historyTable';
	
	// Date column definition. Defines special text generation for the column
	var dateCol = new Column('date', I18n.get('date'), '15%', true);
	this.historyTable.columnList.push(dateCol);
	dateCol.getText = function(object) {
		return moment(object.date).format('DD/MM/YY HH:mm:ss');
	};
	
	// User name column definition
	this.historyTable.columnList.push(new Column('username', I18n.get('username'), '20%', true));
	
	// Mandate field name column definition
	this.historyTable.columnList.push(new Column('entityName', I18n.get('field/action'), '20%', true, true));
	
	// Old value column defninition. Defines special text generation for the column
	var oldValueCol = new Column('oldValue', I18n.get('old.value'), '15%', false);
	this.historyTable.columnList.push(oldValueCol);
	oldValueCol.getAlt = function(object) {
		return that.getValueText(object, 'old');
	};
	oldValueCol.getText = function(object) {
		return that.getValueText(object, 'old');
	};
	
	// New value column definition. Defines special text generation for the column
	var newValueCol = new Column('newValue', I18n.get('new.value'), '30%', false);
	this.historyTable.columnList.push(newValueCol);
	newValueCol.getAlt = function(object) {
		return that.getValueText(object, 'new');
	};
	newValueCol.getText = function(object) {
		return that.getValueText(object, 'new');
	};
};

/**
 * Initialization of the communications table
 */
MandateHistoryModule.prototype.initCommunicationTable = function() {
	// Communication table declaration
	this.communicationTable = new TableModule();
	this.communicationTable.id = 'communicationTable';
	
	// Date column definition. Defines special text generation for the column
	var dateCol = new Column('date', I18n.get('date'), '15%', true);
	this.communicationTable.columnList.push(dateCol);
	dateCol.getText = function(object) {
		return moment(object.date).format('DD/MM/YY HH:mm:ss');
	};
	
	this.communicationTable.columnList.push(new Column('origin', I18n.get('origin'), '25%'));
	
	// Other columns definitions
	var messageCol = new Column('messageKey', I18n.get('message'), '60%');
	this.communicationTable.columnList.push(messageCol);
	messageCol.getText = function(object) {
		return I18n.get(object.messageKey, false, object.messageParams);
	};
};

MandateHistoryModule.prototype.getValueText = function(object, oldNew) {
	var text = '';
	// customize display behavior for mandateAttachedFile
	if (object.entityName == 'MANDATE.PROPERTIES.MANDATEATTACHEDFILELIST'){
		// => do not display old value
		if (oldNew == 'old'){
			return '';
		}
		// => custom display for new value
		if (oldNew == 'new'){
			var val = object[oldNew + 'ValueString'].split(" (");
			text = I18n.get('MandateFileType.' + val[0]) + " (" + val[1];
		}
		return text;
	}
	// customize display behavior for debtor country code
	if (object.entityName == 'MANDATE.DEBTOR.PROPERTIES.COUNTRYCODE'){
		text = countries[object[oldNew + 'ValueString']];
		return text;
	}
	// customize display behavior for mandate status
	if (object.entityName == 'MANDATE.STATUS'){
		text = I18n.get('MandateStatus.' + object[oldNew + 'ValueString'], true);
		return text;
	}
	// generic display
	if (Util.checkString(object[oldNew + 'ValueString'])) {
		text = object[oldNew + 'ValueString'];
		if (object[oldNew + 'ValueString'] != '') {
			text = I18n.get(object[oldNew + 'ValueString'], true);
		}
		return text;
	}
	if (Util.check(object[oldNew + 'ValueDate'])) {
		text = moment(object[oldNew + 'ValueDate']).format('DD/MM/YY HH:mm:ss');
		return text;
	}
};