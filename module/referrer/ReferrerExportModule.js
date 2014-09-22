/**
 * Class ReferrerExportModule.
 * 
 * @author Jean-Luc Scheefer
 */
ReferrerExportModule.inherits(Module);
function ReferrerExportModule() {
	var that = this;
	
	/** -------------------------------- */
	/** create collapsible mandate auto export */
	this.autoExportCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('referrer.export.auto.title') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'collapsed' : false,
		'effect' : 'none'
	});
	/** Input Modules for frequency parameter */
	this.SchedulePeriod = {};
	this.SchedulePeriod.D = EnumManager.SchedulePeriod.D;
	this.SchedulePeriod.W = EnumManager.SchedulePeriod.W;
	this.autoExportCollapsible.inputFrequency = new InputSelectModule({
		'label' : I18n.get('referrer.auto.frequency.label'),
		'options' : this.SchedulePeriod,
		'widthClass' : 'input-large',
		'onChange' : function() { that.frequencyChanged(); }
	});
	/** Input Modules for day parameter */
	this.ScheduleDay = {};//not specified at server side (integer)
	this.ScheduleDay['1'] = "ScheduleDay.MONDAY";
	this.ScheduleDay['2'] = "ScheduleDay.TUESDAY";
	this.ScheduleDay['3'] = "ScheduleDay.WEDNESDAY";
	this.ScheduleDay['4'] = "ScheduleDay.THURSDAY";
	this.ScheduleDay['5'] = "ScheduleDay.FRIDAY";
	this.ScheduleDay['6'] = "ScheduleDay.SATURDAY";
	this.ScheduleDay['7'] = "ScheduleDay.SUNDAY";
	this.autoExportCollapsible.inputDay = new InputSelectModule({
		'label' : I18n.get('referrer.auto.day.label'),
		'options' : this.ScheduleDay,
		'widthClass' : 'input-large'
	});
	/** Input Modules for hour parameter */
	this.autoExportCollapsible.inputHour = new InputTextModule({
		'label' : I18n.get('referrer.auto.hour.label'),
		'placeholder' : I18n.get('HHMM'),
		'validationPattern' : ValidationPattern.VALID_HHMM,
		'widthClass' : 'input-large',
		'value' : '1700'
	});
	this.autoExportCollapsible.saveAutoExportButton = $('<div class="btn-row"><button class="referrer-save-btn">' + I18n.get('save') + '</button></div>');	
	
	/** -------------------------------- */
	/** create collapsible mandate manual export */
	this.manualExportCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('referrer.export.manual.title') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'collapsed' : false,
		'effect' : 'none'
	});
	/** Input Modules for start date parameter */
	this.manualExportCollapsible.inputDateStart = new InputDateModule({
		'label' : I18n.get('referrer.export.manual.date.titleStart'),
		'placeholder' : I18n.get('referrer.export.manual.date.titleStart'),
		'maxDate' : moment().add('days', 1),
		'value' : moment(),
		'onChange' : function(){
			var start = that.manualExportCollapsible.inputDateStart.getMillis();
			that.manualExportCollapsible.inputDateEnd.setMinDate(moment(start));
			that.manualExportCollapsible.inputDateEnd.buildJQ();
			that.manualExportCollapsible.changed = true;
		}
	});
	/** Input Modules for end date parameter */
	this.manualExportCollapsible.inputDateEnd = new InputDateModule({
		'label' : I18n.get('referrer.export.manual.date.titleEnd'),
		'placeholder' : I18n.get('referrer.export.manual.date.titleEnd'),
		'minDate' : moment().add('days', 1),
		'maxDate' : moment().add('days', 1),
		'value' : moment().add('days', 1),
		'onChange' : function(){
			that.manualExportCollapsible.changed = true;
		}
	});
	/** Input Modules for end date parameter */
	this.manualExportCollapsible.launchManualExportButton = $('<div class="btn-row"><button class="referrer-save-btn trigger">' + I18n.get('referrer.export.manual.trigger') + '</button></div>');	
	// init
	this.manualExportCollapsible.changed = true;
}

ReferrerExportModule.neededRoles = function() {
	return ["ROLE_USER", "MANAGE_REFERRER"];
};

ReferrerExportModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	this.autoExportCollapsible.saveAutoExportButton.find('button:first').click(function() { that.saveAutoExportConfig(); });
	this.manualExportCollapsible.launchManualExportButton.find('button:first').click(function() { that.launchManualExport(); });
	
	//mandate auto export
	var jQmandateAutoExport = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.autoExportCollapsible.inputFrequency.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.autoExportCollapsible.inputDay.buildJQ());
	columnRight.append(this.autoExportCollapsible.inputHour.buildJQ());
	jQmandateAutoExport.append(columnLeft).append(columnRight);
	if (!Util.check(this.referrer.exportFrequency)){
		this.autoExportCollapsible.saveAutoExportButton.find("button:first").text(I18n.get('create.new'));
	}
	jQmandateAutoExport.append(this.autoExportCollapsible.saveAutoExportButton);
	//create collapsible mandate auto export
	this.autoExportCollapsible.setContent(jQmandateAutoExport);
	jQ.append(this.autoExportCollapsible.buildJQ());
	this.frequencyChanged(this.referrer.exportDay);
	
	//mandate manual export
	var jQmandateManualExport = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.manualExportCollapsible.inputDateStart.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.manualExportCollapsible.inputDateEnd.buildJQ());
	jQmandateManualExport.append(columnLeft).append(columnRight);
	jQmandateManualExport.append(this.manualExportCollapsible.launchManualExportButton);
	//create collapsible mandate auto export
	this.manualExportCollapsible.setContent(jQmandateManualExport);
	jQ.append(this.manualExportCollapsible.buildJQ());
};

/**
 * Save the auto export parameter to the server
 */
ReferrerExportModule.prototype.saveAutoExportConfig = function(){
	var that = this;
	AjaxManager.postJSON('saveMandatesExport', {
		'referrerId' : that.referrer.id,
		'exportFrequency' : that.autoExportCollapsible.inputFrequency.getValue(),
		'exportDay' : that.autoExportCollapsible.inputDay.getValue(),
		'exportHour' : that.autoExportCollapsible.inputHour.getValue()
	}, function(result) {
		if (result.success){
			that.referrer.exportFrequency = result.exportFrequency;
			that.referrer.exportDay = result.exportDay;
			that.referrer.exportHour = result.exportHour;
			that.autoExportCollapsible.saveAutoExportButton.find("button:first").text(I18n.get('save'));
			PopupModule.getInstance().show({
				'title' : I18n.get('referrer.export.auto.popupOK.title'),
				'content' : I18n.get('referrer.export.auto.popupOK'),
				'button0' : { 'text' : 'OK' }
			});
			NavigationManager.reload();
		} else {
			//popup is handled by AjaxManager
		}
	});
};

/**
 * Trigger a manual export between the two given dates
 */
ReferrerExportModule.prototype.launchManualExport = function(){
	if (this.manualExportCollapsible.changed){
		this.manualExportCollapsible.changed = false;
		var that = this;
		AjaxManager.postJSON('triggerMandatesExport', {
			'referrerId' : that.referrer.id,
			'startDate' : that.manualExportCollapsible.inputDateStart.getMillis(),
			'endDate' : that.manualExportCollapsible.inputDateEnd.getMillis()
		}, function(result) {
			if (result.success){
				PopupModule.getInstance().show({
					'title' : I18n.get('referrer.export.manual.popupOK.title'),
					'content' : I18n.get('referrer.export.manual.popupOK'),
					'button0' : { 'text' : 'OK' }
				});
				NavigationManager.reload();
			} else {
				//popup is handled by AjaxManager
			}
		});
	}
};

/**
 * Change the input day depending on the selected frequency
 * 
 * @param value if a value should be set after changing content of inputDay,
 */
ReferrerExportModule.prototype.frequencyChanged = function(value) {
	this.autoExportCollapsible.inputDay.setReadonly(true);
	this.autoExportCollapsible.inputDay.getJQ().css({ 'opacity': '0.5' });
	if (this.autoExportCollapsible.inputFrequency.getValue() == 'W') {
		this.autoExportCollapsible.inputDay.setOptions(this.ScheduleDay, true);
		this.autoExportCollapsible.inputDay.setReadonly(false);
		this.autoExportCollapsible.inputDay.getJQ().css({ 'opacity': '1' });
	} else {
		this.autoExportCollapsible.inputDay.setOptions({}, true);
	}
	if (Util.check(value)) {
		this.autoExportCollapsible.inputDay.setValue(value);
	}
	this.autoExportCollapsible.inputDay.buildJQ();
};

/**
 * Set the referrer and apply fields
 * 
 * @param referrer
 */
ReferrerExportModule.prototype.setReferrer = function(referrer) {
	this.referrer = referrer;
	if (!Util.checkObject(this.referrer)) {
		return;
	}
	if (Util.check(referrer.exportFrequency)){
		this.autoExportCollapsible.inputFrequency.setValue(referrer.exportFrequency);
		this.frequencyChanged(referrer.exportDay);
		this.autoExportCollapsible.inputHour.setValue(referrer.exportHour);
	}
};

/**
 * Loads referrer
 */
ReferrerExportModule.prototype.loadData = function(callback) {
	this.setReferrer(this.parameters.referrer);
	Util.getFunction(callback)();
};
