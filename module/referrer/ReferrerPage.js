/**
 * Class ReferrerPage.
 * 
 * @author Maxime Ollagnier
 */
ReferrerPage.inherits(Module);
function ReferrerPage() {
	this.referrer = undefined;
	this.tabModules = {};
}

/** Tabs declaration */
ReferrerPage.TAB_INFO = 'info';
ReferrerPage.TAB_ACCOUNT = 'account';
ReferrerPage.TAB_CUSTOM = 'custom';
ReferrerPage.TAB_FLOW = 'flow';
ReferrerPage.TAB_NOTIFICATION = 'notification';
ReferrerPage.TAB_EXPORT = 'export';

/** Default active tab */
ReferrerPage.DEFAULT_ACTIVE_TAB = ReferrerPage.TAB_INFO;

ReferrerPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// title TODO Display status in a cool way
	if (this.parameters.type == InputReferrerModule.TYPE_CREDITOR) {
		if (Util.checkObject(this.referrer)) {
			jQ.append($('<h4>' + I18n.get('creditor') + ' - ' + this.referrer.name + '</h4>'));
		} else {
			jQ.append($('<h4>' + I18n.get('creditor.new') + '</h4>'));
		}
	} else {
		if (Util.checkObject(this.referrer)) {
			jQ.append($('<h4>' + I18n.get('entity') + ' - ' + this.referrer.name + '</h4>'));
		} else {
			jQ.append($('<h4>' + I18n.get('entity.new') + '</h4>'));
		}
	}
	
	// Tabs bar
	if (Util.checkString(this.parameters.tab)) {
		this.activeTab = this.parameters.tab;
	} else {
		this.activeTab = ReferrerPage.DEFAULT_ACTIVE_TAB;
	}
	var tabBar = $('<ul class="nav nav-tabs"></ul>');
	jQ.append(tabBar);
	$.each(this.tabModules, function(tabName, tabModule) {
		tabBar.append($(
			'<li class="' + (tabName == that.activeTab ? ' active' : '') + '">' +
				'<a href="#ReferrerPage?referrerId=' + that.parameters.referrerId + '&type=' + that.parameters.type + '&tab=' + tabName + '">' + I18n.get('referrer.tab.' + tabName) + '</a>' +
			'</li>'
		));
	});
	
	// Tabs content
	var tabContent = $('<div class="tabContent"></div>');
	jQ.append(tabContent);
	tabContent.append($('<div style="margin:0 auto;" class="loading"></div>'));
	this.tabModules[this.activeTab].load({
		'referrer' : this.referrer
	}, function(jQ) {
		tabContent.clear().append(jQ);
	});
};

/**
 * Loads the referrer
 */
ReferrerPage.prototype.loadData = function(callback) {
	var newReferrer = UserManager.getReferrer(this.parameters.referrerId);
	if (newReferrer != this.referrer || !Util.checkObject(newReferrer)) {
		this.referrer = newReferrer;
		
		// Tab modules
		this.activeTab = ReferrerPage.DEFAULT_ACTIVE_TAB;
		this.tabModules = {};
		//tab for creditor only
		if (this.parameters.type == InputReferrerModule.TYPE_CREDITOR) {
			//even if not existing
			this.tabModules[ReferrerPage.TAB_INFO] = new CreditorInfoModule();
			//if existing only
			if (Util.checkObject(this.referrer)) {
				this.tabModules[ReferrerPage.TAB_ACCOUNT] = new CreditorAccountModule();
				this.tabModules[ReferrerPage.TAB_NOTIFICATION] = new CreditorNotificationModule();
			}
		} else {
			//tab for entity only even if not existing
			this.tabModules[ReferrerPage.TAB_INFO] = new EntityInfoModule();
		}
		//tab for entity if existing
		if (Util.checkObject(this.referrer)) {
			this.tabModules[ReferrerPage.TAB_FLOW] = new ReferrerFlowModule();
			this.tabModules[ReferrerPage.TAB_CUSTOM] = new ReferrerCustomModule();
			this.tabModules[ReferrerPage.TAB_EXPORT] = new ReferrerExportModule();
		}
	}
	
	Util.getFunction(callback)();
};
