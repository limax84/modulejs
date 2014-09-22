/**
 * TODO Comment
 * 
 * @author Maxime Ollagnier
 */
MenuMainModule.inherits(Module);
function MenuMainModule() {
	this.jQ = $('#mainMenu');
	
	this.menu1 = new MenuModule({
    	'id' : 'management',
    	'menuBarName' : MenuMainModule.MENU_BAR_NAME,
    	'title' : I18n.get('main.menu.management')
    });
    this.addItem(this.menu1, I18n.get('main.menu.creditors'), ReferrersPage);
    this.addItem(this.menu1, I18n.get('main.menu.mandates'), MandatesPage);
    this.addItem(this.menu1, I18n.get('main.menu.orders'), OrdersModule);
    this.addItem(this.menu1, I18n.get('main.menu.messageInfos'), MessageInfosPage);
    this.addItem(this.menu1, I18n.get('main.menu.users'), UsersPage);
	
    this.menu2 = new MenuModule({
    	'id' : 'reporting',
    	'menuBarName' : MenuMainModule.MENU_BAR_NAME,
    	'title' : I18n.get('main.menu.reporting')
    });
    this.addItem(this.menu2, I18n.get('main.menu.mandates'), MandateReportPage);
    this.addItem(this.menu2, I18n.get('main.menu.orders'), OrderReportPage);
    this.addItem(this.menu2, I18n.get('main.menu.communication'), CommunicationReportPage);
    this.addItem(this.menu2, I18n.get('main.menu.monitoringConsole'), MonitoringConsolePage);
}

/** Menu bar name */
MenuMainModule.MENU_BAR_NAME = 'mainMenu';

/**
 * TODO Comment
 */
MenuMainModule.prototype.fillJQ = function(jQ) {

    if (this.menu1.hasItems()) {
    	jQ.append(this.menu1.buildJQ());
    }
    if (this.menu2.hasItems()) {
    	jQ.append(this.menu2.buildJQ());
    }
};

/**
 * TODO Comment
 */
MenuMainModule.prototype.addItem = function(menuModule, title, module) {
	if (UserManager.hasRoles(module.neededRoles)) {
		menuModule.addItem(title, function() { NavigationManager.goTo(Util.getClassName(module)); });
	}
};


