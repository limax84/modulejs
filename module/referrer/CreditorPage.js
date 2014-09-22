/**
 * Class CreditorPage. TODO To Remove
 * 
 * @author Jean-Luc Scheefer
 */
//CreditorPage.inherits(Module);
//function CreditorPage() {
//	this.creditor = undefined;
//	this.tabModules = {};
//	this.tabModules[CreditorPage.TAB_INFO] = new CreditorInfoModule();
//	this.tabModules[CreditorPage.TAB_ACCOUNT] = new CreditorAccountModule();
//	this.tabModules[CreditorPage.TAB_CUSTOM] = new CreditorCustomModule();
//}
//
///** Tabs declaration */
//CreditorPage.TAB_INFO = 'info';
//CreditorPage.TAB_ACCOUNT = 'account';
//CreditorPage.TAB_CUSTOM = 'custom';
//
///** Default active tab */
//CreditorPage.DEFAULT_ACTIVE_TAB = CreditorPage.TAB_INFO;
//
//CreditorPage.neededRoles = ["ROLE_USER", "VIEW_CREDITOR"];
//
//CreditorPage.prototype.fillJQ = function(jQ) {
//	var that = this;
//	// title
//	jQ.append($('<h4>' + I18n.get('creditor.title1', false, [this.creditor.name]) + '</h4>'));
//	jQ.append($('<h5>' + I18n.get('creditor.title2', false, [I18n.get('CreditorStatus.' + this.creditor.status)]) + '</h5>'));
//	
//	// Tabs bar
//	if (Util.checkString(this.parameters.tab)) {
//		this.activeTab = this.parameters.tab;
//	} else {
//		this.activeTab = CreditorPage.DEFAULT_ACTIVE_TAB;
//	}
//	var tabBar = $('<ul class="nav nav-tabs"></ul>');
//	jQ.append(tabBar);
//	$.each(this.tabModules, function(tabName, tabModule) {
//		tabBar.append($(
//			'<li class="' + (tabName == that.activeTab ? ' active' : '') + '">' +
//				'<a href="#CreditorPage?creditorId=' + that.parameters.creditorId + '&tab=' + tabName + '">' + I18n.get('creditor.tab.' + tabName) + '</a>' +
//			'</li>'
//		));
//	});
//	
//	// Tabs content
//	var tabContent = $('<div class="tabContent"></div>');
//	jQ.append(tabContent);
//	tabContent.append(this.tabModules[this.activeTab].getJQ());
//	this.tabModules[this.activeTab].load({
//		'creditor' : this.creditor
//	});
//};
//
///**
// * Loads the mandate if rum and creditorId are found in parameters
// */
//CreditorPage.prototype.loadData = function(callback) {
//	this.creditor = UserManager.getReferrer(this.parameters.creditorId);
//	Util.getFunction(callback)();
//};
