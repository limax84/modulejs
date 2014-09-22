/**
 * Class Menu Module.
 * 
 * @author Maxime Ollagnier
 * 
 * Needs : Twitter Bootstrap JS
 * 
 * Usage :
 * 
 * var myMenu = new MenuModule({
 *     'id' : 'myId',
 *     'menuBarName' : 'myMenuBarName',
 *     'title' : 'myTitle'
 * });
 * myMenu.addItem('itemText1', function() {...});
 * myMenu.addItem('itemText2', function() {...});
 * myMenu.addDivider();
 * myMenu.addItem('itemText3', function() {...});
 * 
 * $('#myContainer').append(myMenu.getJQ());
 */

function Item(text, callback) {
	if (!Util.check(text)) {
		text = '';
	}
	this.text = text;
	this.callback = Util.getFunction(callback);
	this.isDivider = false;
}

MenuModule.inherits(Module);
function MenuModule(params) {
	params = Util.getObject(params);

	this.setId(params.id);
	this.setTitle(params.title);
	this.setMenuBarName(params.menuBarName);
	this.setPullRight(params.pullRight);
	this.setOpenOnHover(params.openOnHover);

	this.itemList = new List();
    MenuModule.addMenuModule(this.menuBarName, this);
}

/** Default values */
MenuModule.DEFAULT_ID = 'NO_ID';
MenuModule.DEFAULT_MENU_BAR_NAME = 'default';
MenuModule.DEFAULT_TITLE = 'No Title';
MenuModule.DEFAULT_PULL_RIGHT = false;
MenuModule.DEFAULT_OPEN_ON_HOVER = true;

MenuModule.prototype.fillJQ = function(jQ) {
	jQ.addClass('dropdown');
	jQ.append($('<a class="dropdown-toggle" href="#"></a>').append(this.title));
	jQ.append($('<ul id="' + this.getId() + '" class="dropdown-menu' + (this.pullRight ? ' pull-right' : '') + '"></ul>'));
	var that = this;
	this.itemList.foreach(function(index, item) {
		that.appendItemJQ(item);
	});
	this.bindCustomClick();
	return jQ;
};

/**
 * Sets the ID
 * @param id String
 */
MenuModule.prototype.setId = function(id) {
	this.id = id;
	if (!Util.checkString(id)) {
		console.error('MenuModule String id should be provided');
		this.id = MenuModule.DEFAULT_ID;
	}
};

/**
 * Sets the menu bar name
 * @param menuBarName String
 */
MenuModule.prototype.setMenuBarName = function(menuBarName) {
	this.menuBarName = menuBarName;
	if (!Util.checkString(menuBarName)) {
		this.menuBarName = MenuModule.DEFAULT_MENU_BAR_NAME;
	}
};

/**
 * Sets the menu title
 * @param title JQuery
 */
MenuModule.prototype.setTitle = function(title) {
	this.title = title;
	if (!Util.check(title)) {
		this.title = MenuModule.DEFAULT_TITLE;
	}
};

/**
 * Sets the pull right flag
 * @param pullRight Boolean
 */
MenuModule.prototype.setPullRight = function(pullRight) {
	this.pullRight = pullRight;
	if (!Util.checkBool(pullRight)) {
		this.pullRight = MenuModule.DEFAULT_PULL_RIGHT;
	}
};

/**
 * Sets the open on hover flag
 * @param openOnHover Boolean
 */
MenuModule.prototype.setOpenOnHover = function(openOnHover) {
	this.openOnHover = openOnHover;
	if (!Util.checkBool(openOnHover)) {
		this.openOnHover = MenuModule.DEFAULT_OPEN_ON_HOVER;
	}
};

MenuModule.prototype.clearItems = function() {
	this.itemList = new List();
};

MenuModule.prototype.addItem = function(text, callback) {
	var item = new Item(text, callback);
	this.itemList.push(item);
	this.appendItemJQ(item);
};

MenuModule.prototype.hasItems = function() {
	return (this.itemList.size > 0);
};

MenuModule.prototype.addDivider = function() {
	var item = new Item('');
	item.isDivider = true;
	this.itemList.push(item);
	this.appendItemJQ(item);
};

MenuModule.prototype.appendItemJQ = function(item) {
	Util.assertError(Util.checkObject(item), true, 'Invalid item to append to : ' + this.text);
	var jQItem = $('<li class="menu-item ' + (item.isDivider ? 'divider' : 'click') + '"><span class="menu-item-icon">></span></li>');
	jQItem.append(item.text);
	jQItem.click(item.callback);
	this.getJQ().find('ul:first').append(jQItem);
};

MenuModule.prototype.bindCustomClick = function() {
	var that = this;
	$('html').click(function () {
		that.close();
    });
    this.getJQ().find('.dropdown-toggle:first').click(function(event) {
    	// We've handled this event. Don't let anybody else see it. 
    	if (event.stopPropagation) event.stopPropagation( );
        else event.cancelBubble = true; // IE
        // Now prevent any default action.
        if (event.preventDefault) event.preventDefault( );
        else event.returnValue = false; // IE
        that.toggle();
    });
    if (this.openOnHover) {
	    this.getJQ().find('.dropdown-toggle:first').hover(function() {
	    	that.open();
	    },
	    function() {});
    }
};

MenuModule.prototype.toggle = function() {
	if (this.getJQ().hasClass('open')) {
		this.close();
	}
	else {
		this.open();
	}
};

MenuModule.prototype.open = function() {
	if (!this.getJQ().hasClass('open')) {
		MenuModule.closeAll();
		this.getJQ().find('.dropdown-menu:first').stop(true, true).slideDown('fast');
		this.getJQ().addClass('open');
	}
};

MenuModule.prototype.close = function() {
	if (this.getJQ().hasClass('open')) {
		this.getJQ().find('.dropdown-menu:first').stop(true, true).slideUp('fast');
		this.getJQ().removeClass('open');
	}
};

/**
 * Static functionalities for menu bars management
 */
MenuModule.menuBarMap = new Map();

MenuModule.addMenuBar = function(menuBarName) {
	Util.assertThrow(Util.checkString(menuBarName), true, 'New menu bar missing a String name.');
	MenuModule.menuBarMap.put(menuBarName, new List());
};

MenuModule.addMenuModule = function(menuBarName, menuModule) {
	Util.assertThrow(Util.checkString(menuBarName), true, 'Menu bar missing a String name.');
	Util.assertThrow(Util.checkObject(menuModule), true, 'Menu module not an object.');
	var menuModuleList = MenuModule.menuBarMap.get(menuBarName);
	if (!Util.checkObject(menuModuleList)) {
		MenuModule.addMenuBar(menuBarName);
		menuModuleList = MenuModule.menuBarMap.get(menuBarName);
	}
	menuModuleList.push(menuModule);
};

MenuModule.closeAll = function(menuBarNameToClose) {
	MenuModule.menuBarMap.foreach(function(menuBarName, menuModuleList) {
		if (!Util.checkString(menuBarNameToClose) || menuBarName == menuBarNameToClose) {
			menuModuleList.foreach(function(i, menuModule) {
				menuModule.close();
			});
		}
	});
};
