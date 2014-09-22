/**
 * TODO Comment
 * 
 * @author Maxime Ollagnier
 */

MenuUserModule.inherits(Module);
function MenuUserModule() {
	this.jQ = $('#userMenu');
	
    this.menu1 = new MenuModule({
    	'id' : 'userMenu',
    	'menuBarName' : MenuUserModule.MENU_BAR_NAME,
    	'title' : '',
    	'pullRight' : true
    });
    this.addItem(this.menu1, UserManager.user.email);
    this.addItem(this.menu1, UserManager.user.referrer.name);
    this.menu1.addDivider();
    this.addItem(this.menu1, I18n.get('main.menu.change.password'), this.changePassword);
    this.addItem(this.menu1, I18n.get('main.menu.disconnect'), NavigationManager.getLogoutURI());
}

/** Menu bar name */
MenuUserModule.MENU_BAR_NAME = 'userMenu';

/**
 * TODO Comment
 */
MenuUserModule.prototype.fillJQ = function(jQ) {
	jQ.append(this.menu1.buildJQ());
};

/**
 * TODO Comment
 */
MenuUserModule.prototype.addItem = function(menuModule, text, module) {
	if (Util.checkObject(module)) { 
		if (UserManager.hasRoles(module.neededRoles)) {
			menuModule.addItem(text, function() { NavigationManager.goTo(Util.getClassName(module)); });
		}
	} else if (Util.checkString(module)) {
		menuModule.addItem(text, function() { window.location = CONTEXT_ROOT + module; });
	} else if (Util.checkFunction(module)) {
		menuModule.addItem(text, module);
	} else {
		menuModule.addItem(text, function(){});
	}
};

/**
 * TODO Comment
 */
MenuUserModule.prototype.changePassword = function() {
	this.passwordChangeModule = new PasswordChangeModule();
	var that = this;
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('main.menu.change.password'));
	PopupModule.getInstance().addButton(I18n.get('cancel'));
	PopupModule.getInstance().addButton(I18n.get('modify'), function() {
		that.passwordChangeModule.submitChange(function(success, userMessageCode) {
			if (success) {
				PopupModule.getInstance().show({
					'title' : I18n.get('password.changed'),
					'content' : I18n.get('password.changed.desc'),
					'button0' : { 'text' : 'OK' }
				});
			} else {
				var displayMessageCode = Util.checkString(userMessageCode)? userMessageCode : "password.change.error.internal.desc";
				PopupModule.getInstance().show({
					'title' : I18n.get('password.change.error'),
					'content' : I18n.get(displayMessageCode),
					'button0' : { 'text' : 'OK' }
				});
			}
		});
	});
	PopupModule.getInstance().setContent(that.passwordChangeModule.buildJQ());
	PopupModule.getInstance().show();	
};
