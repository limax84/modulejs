/**
 * Class MandatePage.
 * 
 * @author Maxime Ollagnier
 */
MandatePage.inherits(Module);
function MandatePage() {
	this.mandate = undefined;
	this.actionMenu = undefined;
	this.tabModules = {};
}

/** Tabs declaration */
MandatePage.TAB_INFO = 'info';
MandatePage.TAB_FILE = 'file';
MandatePage.TAB_HISTORY = 'history';
MandatePage.TAB_ORDERS = 'orders';

/** Default active tab */
MandatePage.DEFAULT_ACTIVE_TAB = MandatePage.TAB_INFO;

MandatePage.neededRoles = ["ROLE_USER", "VIEW_MANDATE"];

MandatePage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	if (!this.isMandateAware()) {
		jQ.append($('<h4>' + I18n.get('mandate.new') + '</h4>'));
	} else {
		jQ.append($('<h4>' + I18n.get('mandate') + ' - ' + this.parameters.mandateRum + '</h4>'));
		jQ.find('h4:first').append($('<span class="statusTitle MandateStatus_' + this.mandate.status + '">(' + I18n.get('MandateStatus.' + this.mandate.status) + ')</span>'));
		if (Util.checkObject(this.actionMenu)) {
			jQ.find('h4:first').append(this.actionMenu.buildJQ());
		}
	}
	
	// Tabs bar
	if (Util.checkString(this.parameters.tab)) {
		this.activeTab = this.parameters.tab;
	} else {
		this.activeTab = MandatePage.DEFAULT_ACTIVE_TAB;
	}
	var tabBar = $('<ul class="nav nav-tabs"></ul>');
	jQ.append(tabBar);
	if (this.isMandateAware()) {
		$.each(this.tabModules, function(tabName, tabModule) {
			tabBar.append($(
				'<li class="' + (tabName == that.activeTab ? ' active' : '') + '">' +
					'<a href="#MandatePage?mandateRum=' + that.parameters.mandateRum + '&creditorId=' + that.parameters.creditorId + '&tab=' + tabName + '">' + I18n.get('mandate.tab.' + tabName) + '</a>' +
				'</li>'
			));
		});
	} else {
		this.activeTab = MandatePage.TAB_INFO;
		tabBar.append($('<li class="active"></li>')
			.append('<a href="#MandatePage">' + I18n.get('mandate.tab.' + MandatePage.TAB_INFO) + '</a>'));
	}
	
	// Tabs content
	var tabContent = $('<div class="tabContent"></div>');
	jQ.append(tabContent);
	tabContent.append(this.tabModules[this.activeTab].getJQ());
	this.tabModules[this.activeTab].load({
		'mandate' : this.mandate,
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId
	});
};

/**
 * Loads the mandate if rum and creditorId are found in parameters
 */
MandatePage.prototype.loadData = function(callback) {
	if (!this.isMandateAware()) {
		this.setMandate();
		Util.getFunction(callback)();
		return;
	}
	var that = this;
	AjaxManager.getJSON('getMandate', {
		'rum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId
	}, function(result) {
		if (result.success) {
			that.setMandate(result.mandate);
		} else {
			PopupModule.getInstance().show({
				'title' : I18n.get('warning'),
				'content' : I18n.get('mandate.not.found'),
				'button0' : { 'text' : 'OK' }
			});
			console.warn('Mandate not found [rum=' + that.parameters.mandateRum + '; creditorId=' + that.parameters.creditorId);
		}
		Util.getFunction(callback)();
	});
};

MandatePage.prototype.setMandate = function(mandate) {
	var that = this;
	this.mandate = mandate;
	
	// Tab modules
	this.activeTab = MandatePage.DEFAULT_ACTIVE_TAB;

	this.tabModules = {};
	this.tabModules[MandatePage.TAB_INFO] = new MandateInfoModule();
	if (Util.checkObject(this.mandate)) {
		this.tabModules[MandatePage.TAB_FILE] = new MandateFileModule();
		this.tabModules[MandatePage.TAB_HISTORY] = new MandateHistoryModule();
		if (this.isOrderAllowed()) {
			this.tabModules[MandatePage.TAB_ORDERS] = new OrdersModule();
		}
	} else {
		return;
	}
	
	// Action menu
	this.actionMenu = undefined;
	if (this.mandate.status == 'WaitingSignature') {
		this.getActionMenu().addItem(I18n.get('mandate.action.signWithContralia'), function() { that.signWithContralia(); });
	}
	if (this.mandate.status == 'Valid') {
		this.getActionMenu().addItem(I18n.get('mandate.action.revoke'), function() { that.revoke(); });
		this.getActionMenu().addItem(I18n.get('mandate.action.suspend'), function() { that.suspend(); });
	}
	if (this.mandate.status == 'Suspended') {
		this.getActionMenu().addItem(I18n.get('mandate.action.reactivate'), function() { that.reactivate(); });
	}
};

MandatePage.prototype.getActionMenu = function() {
	if (!Util.checkObject(this.actionMenu)) {
		this.actionMenu = new MenuModule({
			'id' : 'mandateActionMenu',
			'menuBarName' : 'actionMenuBar',
			'title' : $('<span class="btn">' + I18n.get('actions') + '<i class="icon-chevron-down icon"/></span>'),
			'pullRight' : true,
			'openOnHover' : false
		});
	}
	return this.actionMenu;
};

MandatePage.prototype.isMandateAware = function() {
	return Util.checkString(this.parameters.mandateRum) && Util.checkString(this.parameters.creditorId);
};

/**
 * Parameters setter.
 * Detects parameter changes.
 * If different mandate -> reinitializes the page
 */
MandatePage.prototype.isOrderAllowed = function() {
	if (	!Util.checkObject(this.mandate) ||
			this.mandate.status == 'Created' ||
			this.mandate.status == 'WaitingSignature') {
		return false;
	}
	return true;
};

/**
 * TODO Comment
 */
MandatePage.prototype.signWithContralia = function() {
	var that = this;
	if (!Util.checkObject(this.mandate)) {
		return;
	}
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('confirmation'));
	PopupModule.getInstance().setContent(I18n.get('mandate.action.signWithContralia.confirmation'));
	PopupModule.getInstance().addButton(I18n.get('cancel'));
	PopupModule.getInstance().addButton('OK', function() {
		AjaxManager.getJSON('getSignWithContraliaUrl', {
			'mandateId' : that.mandate.id
		}, function(result) {
			if (result.success) {
				document.location.href=result.url;
			}
		});
	});
	PopupModule.getInstance().show();
};

/**
 * TODO Comment
 */
MandatePage.prototype.revoke = function() {
	var that = this;
	if (!Util.checkObject(this.mandate)) {
		return;
	}
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('confirmation'));
	PopupModule.getInstance().setContent(I18n.get('mandate.action.revoke.confirmation'));
	PopupModule.getInstance().addButton(I18n.get('cancel'));
	PopupModule.getInstance().addButton('OK', function() {
		AjaxManager.getJSON('revokeMandate', {
			'mandateId' : that.mandate.id
		}, function(result) {
			if (result.success) {
				PopupModule.getInstance().clear();
				PopupModule.getInstance().setTitle(I18n.get('success'));
				PopupModule.getInstance().setContent(I18n.get('mandate.action.revoke.success'));
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
MandatePage.prototype.suspend = function() {
	var that = this;
	if (!Util.checkObject(this.mandate)) {
		return;
	}
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('confirmation'));
	PopupModule.getInstance().setContent(I18n.get('mandate.action.suspend.confirmation'));
	PopupModule.getInstance().addButton(I18n.get('cancel'));
	PopupModule.getInstance().addButton('OK', function() {
		AjaxManager.getJSON('suspendMandate', {
			'mandateId' : that.mandate.id
		}, function(result) {
			if (result.success) {
				PopupModule.getInstance().clear();
				PopupModule.getInstance().setTitle(I18n.get('success'));
				PopupModule.getInstance().setContent(I18n.get('mandate.action.suspend.success'));
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
MandatePage.prototype.reactivate = function() {
	var that = this;
	if (!Util.checkObject(this.mandate)) {
		return;
	}
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('confirmation'));
	PopupModule.getInstance().setContent(I18n.get('mandate.action.reactivate.confirmation'));
	PopupModule.getInstance().addButton(I18n.get('cancel'));
	PopupModule.getInstance().addButton('OK', function() {
		AjaxManager.getJSON('reactivateMandate', {
			'mandateId' : that.mandate.id
		}, function(result) {
			if (result.success) {
				PopupModule.getInstance().clear();
				PopupModule.getInstance().setTitle(I18n.get('success'));
				PopupModule.getInstance().setContent(I18n.get('mandate.action.reactivate.success'));
				PopupModule.getInstance().addButton('OK');
				PopupModule.getInstance().show();
				that.reload();
			}
		});
	});
	PopupModule.getInstance().show();
};