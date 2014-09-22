/**
 * Class CreditorNotificationModule.
 * 
 * @author Maxime Ollagnier
 */
CreditorNotificationModule.inherits(Module);
function CreditorNotificationModule() {
	var that = this;
	
	/** Create select all check box */
	this.inputActivateNotif = new InputCheckboxModule({
		'label' : I18n.get('creditor.notification.selectAll'),
		'widthClass' : '',
		'position' : 'left'
	});
	
	/** --------------------------------- */
	/** Create collapsible general notifs */
	this.generalNotifCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.notification.generalNotif') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'collapsed' : false,
		'effect' : 'none',
		'onUncollapse' : function(f){
			f();
			that.setLabelSize();
		}
	});
	
	/** ------------------------------- */
	/** Create collapsible reject notif */
	this.rejectNotifCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.notification.rejectNotif') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'collapsed' : true,
		'effect' : 'none',
		'onUncollapse' : function(f){
				f();
				that.setLabelSize();
			}
	});
	
	/** ---------------------------------- */
	/** Create notification channels table */
	this.channelsTable = new TableModule({
		'withOddEven' : false,
		'selectable' : true
	});
	this.channelsTable.objectMap = new Map();
	this.channelsTable.id = 'channelsTable';
	// columns definition.
	this.channelsTable.columnList.push(new Column('channel', I18n.get('creditor.notification.table.channel'), '30%', false));
	var activeColumn = new Column('active', I18n.get('creditor.notification.table.active'), '15%', false);
	activeColumn.getAlt = undefined;
	activeColumn.getText = function(channel) {
		var jQCheckbox = $('<input type="checkbox" ' + (channel.active ? 'checked="checked"' : '') + '></input>');
		jQCheckbox.change(function(){
			channel.active = $(this).is(':checked');
			that.channelChanged(channel);
		});
		return jQCheckbox;
	};
	this.channelsTable.columnList.push(activeColumn);
	var accessModelColumn = new Column('model', I18n.get('creditor.notification.table.model', true, ['']), '55%', false);
	accessModelColumn.getAlt = undefined;
	this.channelsTable.columnList.push(accessModelColumn);
	
	/** ---------------------------------- */
	/** Create language selection input */
	this.inputSelectLanguage = new InputSelectModule({
		'label' : I18n.get('creditor.notification.model.label'),
		'widthClass' : 'input-large'
	});
	
}

CreditorNotificationModule.neededRoles = function() {
	return ['ROLE_USER', 'MANAGE_NOTIFICATIONS'];
};

CreditorNotificationModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	jQ.append($('<h5>' + I18n.get('referrer.tab.notification') + '</h5>'));
	
	var columnLeft = $('<div class="span6 notif-left"></div>');
	columnLeft.append(this.inputActivateNotif.buildJQ());
	
	this.inputNotifications = {};
	//create collapsibles notif
	var contentNotif = $('<div class="form well row-fluid"></div>');
	var contentReject = $('<div class="form well row-fluid"></div>');
	for (var i=0;i<this.notifications.length;i++){
		//creating notification checkbox and label
		var notif = this.notifications[i];
		if (notif.category != 'NOTIFICATION' && notif.category != 'REJECTION'){
			continue;
		}
		var jqNotif = new InputCheckboxModule({
			'label' : I18n.get('creditor.notification.notif.'+notif.type),
			'value' : notif.enabled,
			'widthClass' : '',
			'position' : 'left'
		});
		this.inputNotifications[notif.type] = jqNotif;
		if (notif.category == 'NOTIFICATION'){
			contentNotif.append(jqNotif.buildJQ());
		} else if (notif.category == 'REJECTION'){
			contentReject.append(jqNotif.buildJQ());
		}
		//Action when selecting a label
		var label = jqNotif.getJQ().find('label:first');
		label.data('type',notif.type);
		label.click(function(){
			that.generalNotifCollapsible.getJQ().find('label').removeClass('selected');
			that.rejectNotifCollapsible.getJQ().find('label').removeClass('selected');
			$(this).addClass('selected');
			that.notificationSelected($(this).data("type"));
			that.divHolder.hide();
		});
	}
	//create collapsible general notif
	this.generalNotifCollapsible.setContent(contentNotif);
	columnLeft.append(this.generalNotifCollapsible.buildJQ());
	
	//create collapsible rejection
	this.rejectNotifCollapsible.setContent(contentReject);
	columnLeft.append(this.rejectNotifCollapsible.buildJQ());
	jQ.append(columnLeft);
	
	// right column
	var columnRight = $('<div class="span6 notif-right"></div>');
	columnRight.append('<h5>' + I18n.get('creditor.notification.leftTitle') + '</h5>');
	columnRight.append(this.channelsTable.buildJQ());
	this.divHolder = $('<div></div>');
	this.divHolder.append('<h5>' + I18n.get('creditor.notification.leftTitleViewModel') + '</h5>');
	this.divHolder.append(this.inputSelectLanguage.buildJQ());
	var viewModelButton = $('<div class="btn-row"></div>');
	viewModelButton.append($('<button class="btn">' + I18n.get('creditor.notification.notif.viewModel') + '</button>'));
	viewModelButton.click(function() { that.viewModel(); });
	this.divHolder.append(this.inputSelectLanguage.buildJQ());
	this.divHolder.append(viewModelButton);
	columnRight.append(this.divHolder);
	this.divHolder.hide();
	jQ.append(columnRight);
	
	//save button if allowed
	if (UserManager.hasRoles(['MANAGE_CREDITOR', 'MANAGE_NOTIFICATIONS'])) {
		var jQCreditorSaveButton = $('<div class="btn-row"></div>');
		jQCreditorSaveButton.append($('<button class="creditor-save-btn">' + I18n.get('save') + '</button>'));
		jQCreditorSaveButton.click(function() { that.saveCreditorNotifications(); });
		jQ.append(jQCreditorSaveButton);
	}
	
	this.setLabelSize();
};

/**
 * Fix the size of every checkbox labels in the collapsible. 
 * Allow big line to be multiline without going under the checkbox.
 * This method exists just to beautify the rendering
 */
CreditorNotificationModule.prototype.setLabelSize = function() {
	$.each(this.inputNotifications, function(index, jqNotif) {
		var jq  = jqNotif.getJQ();
		var label = jq.find("label:first");
		var newWidth = 
			jq.innerWidth() - // surrounding element inner width 
			jq.find(".input:first").outerWidth(true) - //div containing checkbox outer width including margin
			(label.outerWidth(true) - label.width()) - //size of padding, border, and margin of label
			4;//security margin
		if (newWidth > 0 && newWidth < label.width()) {
			label.width(newWidth);
		}
	});
};

/**
 * Called when a the checkbox of a channel is changed
 */
CreditorNotificationModule.prototype.channelChanged = function(channel){
	if (!Util.checkObject(channel)){
		console.warn("Channel cannot be logged !");
		return;
	}
	//set channel update in model
	channel.ref.enabled = channel.active;
};

/**
 * Called when a notification is selected on the left side
 */
CreditorNotificationModule.prototype.notificationSelected = function(type) {
	var that = this;
	var channels = this.notifications[type].channels;
	this.channelsTable.objectMap = new Map();
	for (var i=0;i<channels.length;i++) {
		var viewModelLink;
		if (channels[i].languages.length>0){
			viewModelLink = $('<a href="javascript:;">' + I18n.get('creditor.notification.table.model', false, [I18n.get('creditor.notification.table.channel.'+channels[i].channel)]) + '</a>');
		} else {
			viewModelLink = $('<span>' + I18n.get('creditor.notification.table.noModel') + '</span>');
		}
		viewModelLink.data('channelId',channels[i].channelId);
		viewModelLink.data('languages',channels[i].languages);
		viewModelLink.click(function(){
			that.displayViewModel($(this));
		});
		this.channelsTable.objectMap.put(this.channelsTable.objectMap.size,{
			'ref' : channels[i],
			'channel' : I18n.get('creditor.notification.table.channel.'+channels[i].channel),
			'active' : channels[i].enabled,
			'model' : viewModelLink
			});
	}
	this.channelsTable.buildJQ();
};

/**
 * Display the languages selector and viewer button if needed, hide it otherwise 
 */
CreditorNotificationModule.prototype.displayViewModel = function(jqObj) {
	if (jqObj.data('languages').length > 0){
		//prepare data
		this.inputSelectLanguage.getJQ().data('channelId',jqObj.data('channelId'));
		var langsArray = jqObj.data('languages');
		var languages = {};
		for (var i = 0; i<langsArray.length; i++){
			languages[langsArray[i]] = I18n.get('creditor.notification.languages.' + langsArray[i]);
		}
		//update select and display
		this.inputSelectLanguage.setOptions(languages, true);
		this.inputSelectLanguage.buildJQ();
		this.divHolder.fadeOut(100).delay(300).fadeIn(100);//I use fadeIn/fadeOut because hide/show does not work with delay()
	} else {
		this.divHolder.hide();
	}
};

/**
 * Open a new popup window and load the PDF
 */
CreditorNotificationModule.prototype.viewModel = function() {
	var chan = this.inputSelectLanguage.getJQ().data('channelId');
	var lang = this.inputSelectLanguage.getValue();
	window.open(AjaxManager.getBaseUrl()+'notificationModel?chan=' + chan + '&lang=' + lang, '', 'toolbar=0,menubar=0,resizable=1,width=600,height=800,top=50,left=150');
};

/**
 * Save notifications
 */
CreditorNotificationModule.prototype.saveCreditorNotifications = function() {
	var that = this;
	
	//save general switch
	this.notificationsON = this.inputActivateNotif.getValue();
	
	//save notifications
	for (var i=0; i<this.notifications.length; i++) {
		if (Util.check(this.inputNotifications[this.notifications[i].type])) {
			this.notifications[i].enabled = this.inputNotifications[this.notifications[i].type].getValue();
		}
	}
	
	//to simplify, channels are automatically saved by 'CreditorNotificationModule.prototype.channelChanged' method
	
	//Send to server
	var cred = new Object();
	cred.id = this.creditor.id;
	cred.notifications = this.notifications;
	cred.notificationsON = this.notificationsON;
	AjaxManager.postJSON('saveNotifications', {
		'creditor' : JSON.stringify(cred)
	}, function(result) {
		if (result.success){
			that.creditor.notifications = result.notifications;
			that.creditor.notificationsON = that.notificationsON;
			PopupModule.getInstance().show({
				'title' : I18n.get('creditor.notifications.save.successT'),
				'content' : I18n.get('creditor.notifications.save.success'),
				'button0' : { 'text' : 'OK' }
			});
			NavigationManager.reload();
		} else {
			//popup is handled by AjaxManager
		}
	});
};

CreditorNotificationModule.prototype.setCreditor = function(creditor) {
	this.creditor = creditor;
	if (!Util.checkObject(this.creditor)) {
		return;
	}
};

CreditorNotificationModule.prototype.setNotifications = function(creditor) {
	if (!Util.checkObject(creditor) || !Util.checkObject(creditor.notifications)) {
		return;
	}
	this.notifications = creditor.notifications;
	this.notificationsON = creditor.notificationsON;
	
	this.inputActivateNotif.setValue(this.notificationsON);
};

/**
 * Loads the mandate if rum and creditorId are found in parameters
 */
CreditorNotificationModule.prototype.loadData = function(callback) {
	this.setCreditor(this.parameters.referrer);
	this.setNotifications(this.parameters.referrer);
	Util.getFunction(callback)();
};
