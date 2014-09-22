/**
 * Class Collapsible Module.
 * 
 * @author Jean-Luc Scheefer
 */
CollapsibleModule.inherits(Module);
function CollapsibleModule(params) {
	params = Util.getObject(params);
	this.setCollapsed(params.collapsed);
	this.setEffect(params.effect);
	this.setShowCollapsibleIcon(params.showCollapsibleIcon);
	this.setIconClasses(params.iconClasses);
	this.setTitle(params.title);
	this.setContent(params.content);
	this.setOnUncollapse(params.onUncollapse);
	this.setOnCollapse(params.onCollapse);
}

/** Default values */
CollapsibleModule.DEFAULT_COLLAPSED = true;
CollapsibleModule.DEFAULT_EFFECT = 'slide'; // Possible values are ['slide', 'none']
CollapsibleModule.DEFAULT_SHOW_COLLAPSIBLE_ICON = 'append'; // Possible values are ['prepend', 'append', 'none']
CollapsibleModule.DEFAULT_ICON_CLASSES = ['icon-minus', 'icon-plus']; // CSS classes from twitter bootstrap
CollapsibleModule.DEFAULT_TITLE = '';
CollapsibleModule.DEFAULT_CONTENT = '';
CollapsibleModule.DEFAULT_ON_UNCOLLAPSE = function(callback) { callback(); };
CollapsibleModule.DEFAULT_ON_COLLAPSE = function(callback) { callback(); };

/**
 * Fills the given jQuery element
 */
CollapsibleModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	var jQTitle = $('<div class="title"></div>').append(this.title);
	if (this.showCollapsibleIcon == 'prepend' || this.showCollapsibleIcon == 'append'){
		jQTitle[this.showCollapsibleIcon](' ');
		jQTitle[this.showCollapsibleIcon]($('<i class="' + this.iconClasses[this.collapsed ? 1 : 0] + ' icon"/>'));
	}
	jQTitle.click(function() {
		that.toggle();
	});
	jQ.append(jQTitle);
	
	// Content
	var jQContent = $('<div class="content"></div>').append(this.content);
	if (this.collapsed) {
		jQContent.hide();
	}
	jQ.append(jQContent);
	
	return jQ;
};

/**
 * Toggle the content between collapsed/uncollapsed state
 */
CollapsibleModule.prototype.toggle = function() {
	var that = this;
	if (Util.checkArray(this.iconClasses)) {
		this.getJQ().find('.icon:first').toggleClass(this.iconClasses[0]).toggleClass(this.iconClasses[1]).addClass('loading');
	}
	var toggleMethod = this.effect == 'slide' ? 'slideToggle' : 'toggle';
	var collapseMethod = this.collapsed ? 'onUncollapse' : 'onCollapse';
	this[collapseMethod](function() {
		this.collapsed = !this.collapsed;
		that.getJQ().children('.content:first')[toggleMethod]();
		that.getJQ().find('.icon:first').removeClass('loading');
	});
};

/**
 * uncollapse the content
 */
CollapsibleModule.prototype.uncollapse = function() {
	var that = this;
	if (Util.checkArray(this.iconClasses)) {
		this.getJQ().find('.icon:first').removeClass(this.iconClasses[0]).addClass(this.iconClasses[1]);
	}
	var uncollapseMethod = this.effect == 'slide' ? 'slideDown' : 'show';
	that.getJQ().children('.content:first')[uncollapseMethod]();
};

/**
 * Set the module as collapsed or not
 * 
 * @param collapsed true if collapsed, false otherwise
 */
CollapsibleModule.prototype.setCollapsed = function(collapsed) {
	this.collapsed = collapsed;
	if (!Util.checkBool(collapsed)) {
		this.collapsed = CollapsibleModule.DEFAULT_COLLAPSED;
	}
};

/**
 * Set the effect use to animate the collapse/uncollapse action
 * 
 * @param effect effect as a string, possible values are :
 *        "slide" : slide effect
 *        "none"  : no effect
 */
CollapsibleModule.prototype.setEffect = function(effect) {
	this.effect = effect;
	if (!Util.checkStringNotEmpty(effect)) {
		this.effect = CollapsibleModule.DEFAULT_EFFECT;
	}
};

/**
 * Set if the fold icons will be displayed or not
 * 
 * @param showCollapsibleIcon, possible values are :
 *        "prepend" : the fold icon will be prepended to the title JQ object
 *        "append"  : the fold icon will be appended to the title JQ object
 *        "none"    : the fold icon will not be displayed
 */
CollapsibleModule.prototype.setShowCollapsibleIcon = function(showCollapsibleIcon) {
	this.showCollapsibleIcon = showCollapsibleIcon;
	if (!Util.checkStringNotEmpty(showCollapsibleIcon)) {
		this.showCollapsibleIcon = CollapsibleModule.DEFAULT_SHOW_COLLAPSIBLE_ICON;
	} else {
		this.showCollapsibleIcon = this.showCollapsibleIcon.toLowerCase();
	}
};

/**
 * Set the classes of the fold icon
 * 
 * @param iconClasses an array of length 2. 
 *        The first element must be a string class representing the collapsed state.
 *        The second element must be a string representing the 
 */
CollapsibleModule.prototype.setIconClasses = function(iconClasses) {
	this.iconClasses = iconClasses;
	if (!Util.checkArray(iconClasses) || iconClasses.length < 2) {
		this.iconClasses = CollapsibleModule.DEFAULT_ICON_CLASSES;
	}
};

/**
 * Set the title
 * 
 * @param title a JQ object specifying the title
 */
CollapsibleModule.prototype.setTitle = function(title) {
	this.title = title;
	if (!Util.checkJQuery(title)) {
		this.title = CollapsibleModule.DEFAULT_TITLE;
	}
};

/**
 * Set the content of the foldModule
 * 
 * @param content a JQ object specifying the content
 */
CollapsibleModule.prototype.setContent = function(content) {
	this.content = content;
	if (!Util.checkJQuery(content)) {
		this.content = CollapsibleModule.DEFAULT_CONTENT;
	}
};

/**
 * Set callback method when content is uncollapsed
 * 
 * @param onUncollapse a callback function
 */
CollapsibleModule.prototype.setOnUncollapse = function(onUncollapse) {
	this.onUncollapse = onUncollapse;
	if (!Util.checkFunction(onUncollapse)) {
		this.onUncollapse = CollapsibleModule.DEFAULT_ON_UNCOLLAPSE;
	}
};

/**
 * Set callback method when content is collapsed
 * 
 * @param onCollapse a callback function
 */
CollapsibleModule.prototype.setOnCollapse = function(onCollapse) {
	this.onCollapse = onCollapse;
	if (!Util.checkFunction(onCollapse)) {
		this.onCollapse = CollapsibleModule.DEFAULT_ON_COLLAPSE;
	}
};

CollapsibleModule.prototype.validate = function() {
	valid = this.parentMethod(Module, 'validate');
	if (!valid){
		this.setInvalid(I18n.get('CollapsibleModule.invalid.errorMessage'));
	}
	return valid;
};

/**
 * Set the module JQ representation to an invalid state
 */
CollapsibleModule.prototype.setInvalid = function(errorMessage) {
	this.getJQ().addClass('invalid');
	if (Util.checkString(errorMessage)) {
		this.getJQ().attr('title', errorMessage);
	}
	this.getJQ().children('.content:first').show();
};