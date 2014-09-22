/**
 * Class MonitoringConsolePage.
 * 
 * @author Jean-Luc Scheefer
 */
MonitoringConsolePage.inherits(Module);
function MonitoringConsolePage() {
	var that = this;

	// Inputs module
	this.inputBeginDate = new InputDateModule({
		'label' : I18n.get('monitoring.begin.date'),
		'placeholder' : I18n.get('monitoring.begin.date'),
		'maxDate' : moment().add('days', 1),
		'value' : moment(),
		'onChange' : function(){
			var start = that.inputBeginDate.getMillis();
			that.inputEndDate.setMinDate(moment(start));
			if (Util.checkStringEmpty(that.inputEndDate.getValue())){
				that.inputEndDate.setValue(that.inputEndDate.maxDate);
			}
			that.inputEndDate.buildJQ();
		}
	});
	this.inputEndDate = new InputDateModule({
		'label' : I18n.get('monitoring.end.date'),
		'placeholder' : I18n.get('monitoring.end.date'),
		'minDate' : moment().add('days', 1),
		'maxDate' : moment().add('days', 1),
		'value' : moment().add('days', 1)
	});
	//special default init for those dates, not set by default
	this.inputBeginDate.value = '';
	this.inputEndDate.value = '';
	//input referrer
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'value' : UserManager.user.referrer,
		'rootReferrer' : UserManager.user.referrer,
		'mandatory' : true
	});
	
	//*********************************************************************************
	// collapsibles
	this.availableCollapsibles = ["PAIN_008_IMPORT", "EXPORT_MANDATES"];
	
	for (var i=0; i<this.availableCollapsibles.length; i++){
		//collapsible type
		var name = this.availableCollapsibles[i];
		//collapsible
		this[name] = new CollapsibleModule({
			'title' : $('<h5>' + I18n.get('monitoring.console.' + name) + '</h5>'),
			'showCollapsibleIcon' : 'prepend',
			'onUncollapse' : function(callback) { that.loadMonitoring(callback); }
		});
		//monitoring table
		this[name].table = new TableModule();
		var table = this[name].table;
		table.id = name;
		table.columnList.push(new Column('id', I18n.get('monitoring.console.column.id'), '8%', true));
		var startDateCol = new Column('startDate', I18n.get('monitoring.console.column.startDate'), '14%', true); table.columnList.push(startDateCol);
		var endDateCol = new Column('endDate', I18n.get('monitoring.console.column.endDate'), '14%', true); table.columnList.push(endDateCol);
		var initiatorCol = new Column('initiator', I18n.get('monitoring.console.column.initiator'), '13%', true); table.columnList.push(initiatorCol);
		table.columnList.push(new Column('message', I18n.get('monitoring.console.column.message'), '37%', false));
		var statusCol = new Column('status', I18n.get('monitoring.console.column.status'), '14%', true); table.columnList.push(statusCol);
		startDateCol.getText = function(task) { 
			return moment(task.startDate).format('DD/MM/YY HH:mm:ss');
		};
		endDateCol.getText = function(task) {
			if (task.endDate == ""){
				return "-";
			} else {
				return moment(task.endDate).format('DD/MM/YY HH:mm:ss');
			}
		};
		initiatorCol.getText = function(task) {
			return I18n.get('monitoring.table.initiator.' + task.initiator);
		};
		statusCol.getText = function(task) {
			return '<span class="consoleStatus_' + task.status + '">' + I18n.get('monitoring.table.status.' + task.status) + '</span>';
		};
		statusCol.getAlt = function(task) {
			return I18n.get('monitoring.table.status.' + task.status);
		};
	}
	
	//init
	this.monitoringLoaded = false;
}

MonitoringConsolePage.neededRoles = ["ROLE_USER", "VIEW_REPORTING"];

MonitoringConsolePage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('monitoring.console.pageTitle') + '</h4>'));
	
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
	buttonSearch.click(function() {
		that.loadMonitoring();
	});
	buttonRow.append(buttonSearch);
	
	//collapsibles and tables
	for (var i=0; i<this.availableCollapsibles.length; i++){
		//collapsible type
		var name = this.availableCollapsibles[i];
		//add table to collapsible
		this[name].setContent(this[name].table.buildJQ());
		//add collapsible to content
		jQ.append(this[name].buildJQ());
	}
};

MonitoringConsolePage.prototype.loadMonitoring = function(callback) {
	if (!Util.checkFunction(callback) || (Util.checkFunction(callback) && this.monitoringLoaded == false)){
		var that = this;
		AjaxManager.getJSON('getMonitoringConsole', {
			'startDate' : this.inputBeginDate.getMillis(),
			'endDate' : this.inputEndDate.getMillis(),
			'referrerId' : this.inputReferrer.value.id
		}, function(result) {
			if (result.success) {
				if (result.tasks.size == 0){
					if (!Util.checkFunction(callback)){
						PopupModule.getInstance().show({
							'title' : I18n.get('monitoring.console.noResultT'),
							'content' : I18n.get('monitoring.console.noResult'),
							'button0' : { 'text' : 'OK' }
						});
					}
				} else {
					//fill each collapsible
					for (var n = 0; n<that.availableCollapsibles.length; n++){
						var name = that.availableCollapsibles[n];
						var table = that[name].table;
						table.objectMap = new Map();
						//fill the correponding map
						var list = result.tasks[name];
						if (Util.checkArray(list)){
							for (var i = 0; i < list.length; i++) {
								table.objectMap.put(table.objectMap.size, list[i]);
							}
							table.objectMap.sort('startDate', true);
							//if search button is pressed, uncollapse where results have been found
							if (!Util.checkFunction(callback) && list.length > 0) {
								that[name].uncollapse();
							}
						}
						table.buildJQ();
					}
				}
			} else {
				console.error('Failed to load monitoring [referrerId=' + that.inputReferrer.value.id + ']');
			}
			Util.getFunction(callback)();
		});
		this.monitoringLoaded = true;
	} else {
		Util.getFunction(callback)();
	}
};
