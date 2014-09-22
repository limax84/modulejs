/**
 * Class Referrer Select Module.
 * 
 * @author Maxime Ollagnier
 */
InputReferrerModule.inherits(InputModule);
function InputReferrerModule(params) {
	params = Util.getObject(params);
	this.parentConstructor(InputModule, params);

	this.setSelectableType(params.selectableType);
	this.setOnSelect(params.onSelect);
	this.setRootReferrer(params.rootReferrer);
	this.setPopupMode(params.popupMode);
	this.setFilter(params.filter);
	this.setExpanded(params.expanded);
	this.setWidthClass(params.widthClass);
	this.setDisabledReferrers(params.disabledReferrers);
}

/** Default values */
InputReferrerModule.prototype.DEFAULT_VALUE = undefined;
InputReferrerModule.prototype.DEFAULT_SELECTABLE_TYPE = InputReferrerModule.TYPE_BOTH;
InputReferrerModule.prototype.DEFAULT_ON_SELECT = function() {};
InputReferrerModule.prototype.DEFAULT_ROOT_REFERRER = function() { return UserManager.user.referrer; };
InputReferrerModule.prototype.DEFAULT_POPUP_MODE = true;
InputReferrerModule.prototype.DEFAULT_FILTER = {};
InputReferrerModule.prototype.DEFAULT_EXPANDED = false;
InputReferrerModule.prototype.DEFAULT_WIDTH_CLASS = 'xlarge-input';
InputReferrerModule.prototype.DEFAULT_DISABLED_REFERRERS = [];

/** Selectable referrer types */
InputReferrerModule.TYPE_CREDITOR = 'creditor';
InputReferrerModule.TYPE_ENTITY = 'not creditor';
InputReferrerModule.TYPE_ALL = 'all';

/**
 * Fills the given jQuery element
 */
InputReferrerModule.prototype.fillJQ = function(jQ) {
	if (this.popupMode) {
		jQ.append($('<label></label>').append(this.label).append(this.mandatory ? '*' : ''));
		jQ.append($(
			'<div class="input input-append">' +
				'<input class="' + this.widthClass + '-append" type="text" readonly value="' + (Util.checkObject(this.value) ? this.value.name : '') + '">' +
				'<span class="add-on"><i class="icon-search icon"/></span>' +
			'</div>'));
		var that = this;
		if (this.readonly) {
			jQ.find('input:first').addClass('readonly');
			return jQ;
		}
		jQ.find('.input').click(function() {
			PopupModule.getInstance().clear();
			PopupModule.getInstance().setTitle(I18n.get('creditor.select.modal.title'));
			PopupModule.getInstance().setContent($('<div id="' + that.getId() + '"></div>').append(that.getJQReferrer(that.rootReferrer)));
			PopupModule.getInstance().addButton('Cancel');
			PopupModule.getInstance().show();
		});
		
	} else {
		jQ.append(this.getJQReferrer(this.rootReferrer));
	}
	return jQ;
};

/**
 * Generates the JQ representation of a referrer and its children referrers
 */
InputReferrerModule.prototype.getJQReferrer = function(referrer, disabled) {
	if (!this.visible(referrer)) {
		return '';
	}
	
	// Finds out if the referrer is disabled or not
	disabled = (disabled === true || disabled === 'true') || this.disabledReferrers.contains(referrer);
	
	// Generates the actual referrer JQ representation
	var that = this;
	var jQReferrer = $('<div class="referrer' + (this.value === referrer ? ' selected' : '') + (disabled ? ' disabled' : '') + '"></div>');
	jQReferrer.append($('<div class="name"><i class="icon">&nbsp;</i><span class="name">' + referrer.name.showStr(Util.getString(this.filter.name), 'b', 'searchStr') + '</span></div>'));
	
	// Binds the CLICK event
	if (!disabled && ( 
			(this.selectableType == InputReferrerModule.ALL) ||
			(this.selectableType == InputReferrerModule.TYPE_CREDITOR && referrer.type == InputReferrerModule.TYPE_CREDITOR) ||
			(this.selectableType == InputReferrerModule.TYPE_ENTITY && referrer.type != InputReferrerModule.TYPE_CREDITOR)
		)) {
		jQReferrer.addClass('selectable').find('.name:first span').click(function() {
	    	that.setValue(referrer);
	    	that.validate();
	    	that.buildJQ();
	    	PopupModule.getInstance().hide();
	    	Util.getFunction(that.onSelect).call(that, referrer);
	    });	
	}
	
	if (referrer.type != InputReferrerModule.TYPE_CREDITOR) {
		if (!Util.checkBool(referrer.expanded)) {
			referrer.expanded = this.expanded;
		}
		if (referrer.expanded) {
			jQReferrer.addClass('expanded');
			jQReferrer.find('.name:first i').addClass('icon-minus');
		} else {
			jQReferrer.find('.name:first i').addClass('icon-plus');
		}
		jQReferrer.find('.name:first i').click(function() {
			referrer.expanded = !referrer.expanded;
			jQReferrer.toggleClass('expanded');
			if (jQReferrer.hasClass('expanded')) {
				jQReferrer.find('i:first').removeClass('icon-plus');
				jQReferrer.find('i:first').addClass('icon-minus');
			} else {
				jQReferrer.find('i:first').removeClass('icon-minus');
				jQReferrer.find('i:first').addClass('icon-plus');
			}
		});
		
		var jQChildren = $('<div class="children"></div>');
		jQReferrer.append(jQChildren);
		$.each(referrer.children, function(index, childReferrer) {
			jQChildren.append(that.getJQReferrer(childReferrer, disabled));
		});
		jQReferrer.addClass('entity');
	} else {
		jQReferrer.addClass('creditor');
		jQReferrer.children('.name:first').append('<span class="info">( ' + referrer.ics.showStr(Util.getString(this.filter.ics), 'b', 'searchStr') + ' / ' + referrer.nne.showStr(Util.getString(this.filter.nne), 'b', 'searchStr') + ' )</span>');
	}
	
	return jQReferrer;
};

/**
 * Sets the root referrer
 * @param rootReferrer Object
 */
InputReferrerModule.prototype.setRootReferrer = function(rootReferrer) {
	this.rootReferrer = rootReferrer;
	if (!Util.checkObject(rootReferrer)) {
		this.rootReferrer = this.DEFAULT_ROOT_REFERRER();
	}
	return this;
};

/**
 * Sets the onSelect callback function
 * @param onSelect Function
 */
InputReferrerModule.prototype.setOnSelect = function(onSelect) {
	this.onSelect = onSelect;
	if (!Util.checkFunction(onSelect)) {
		this.onSelect = this.DEFAULT_ON_SELECT;
	}
	return this;
};

/**
 * Sets the selectable referrer type
 * @param selectableType (InputReferrerModule.TYPE_CREDITOR; InputReferrerModule.TYPE_ENTITY; InputReferrerModule.TYPE_ALL)
 */
InputReferrerModule.prototype.setSelectableType = function(selectableType) {
	this.selectableType = selectableType;
	if (!Util.checkString(selectableType)) {
		this.selectableType = this.DEFAULT_SELECTABLE_TYPE;
	}
	return this;
};

/**
 * Sets the popup mode
 * @param popupMode Boolean
 */
InputReferrerModule.prototype.setPopupMode = function(popupMode) {
	this.popupMode = popupMode;
	if (!Util.checkBool(popupMode)) {
		this.popupMode = this.DEFAULT_POPUP_MODE;
	}
	return this;
};

/**
 * Sets the filter object
 * @param filter Object
 */
InputReferrerModule.prototype.setFilter = function(filter) {
	this.filter = filter;
	if (!Util.checkObject(filter)) {
		this.filter = this.DEFAULT_FILTER;
	}
	return this;
};

/**
 * Sets the default expansion state
 * @param expanded Boolean
 */
InputReferrerModule.prototype.setExpanded = function(expanded) {
	this.expanded = expanded;
	if (!Util.checkBool(expanded)) {
		this.filter = this.DEFAULT_EXPANDED;
	}
	return this;
};

/**
 * Sets disabled referrers. Their children will be also disabled
 * @param disabledReferrers Array
 */
InputReferrerModule.prototype.setDisabledReferrers = function(disabledReferrers) {
	this.disabledReferrers = disabledReferrers;
	if (!Util.checkArray(disabledReferrers)) {
		this.disabledReferrers = this.DEFAULT_DISABLED_REFERRERS;
	}
	return this;
};


/**
 * Expand or collapse every referrer
 * @param expand Boolean
 */
InputReferrerModule.prototype.expandAll = function(expand) {
	if (!Util.checkBool(expand)) {
		console.error('Boolean expected');
		return;
	}
	this.expand(this.rootReferrer, expand);
	this.buildJQ();
};

/**
 * Expand or collapse the specified referrer and its children
 * @param referrer Object
 * @param expand Boolean
 */
InputReferrerModule.prototype.expand = function(referrer, expand) {
	if (referrer.type != InputReferrerModule.TYPE_CREDITOR) {
		referrer.expanded = expand;
		var that = this;
		$.each(referrer.children, function(index, childReferrer) {
			that.expand(childReferrer, expand);
		});
	}
};

/**
 * TODO Comment
 */
InputReferrerModule.prototype.visible = function(referrer) {
	var that = this;
	var name = Util.getString(this.filter.name).toLowerCase();
	
	if (referrer.type == InputReferrerModule.TYPE_CREDITOR) {
		var ics = Util.getString(this.filter.ics).toLowerCase();
		var nne = Util.getString(this.filter.nne).toLowerCase();
		var status = Util.getString(this.filter.status).toLowerCase();
		
		return referrer.name.toLowerCase().indexOf(name) >= 0 &&
			referrer.ics.toLowerCase().indexOf(ics) >= 0 &&
			referrer.nne.toLowerCase().indexOf(nne) >= 0 &&
			(referrer.status.toLowerCase() == status || status == '');
	}
	var visible = referrer.name.toLowerCase().indexOf(name) >= 0;
	$.each(referrer.children, function(index, childReferrer) {
		visible = visible || that.visible(childReferrer);
	});
	return visible;
};

/**
 * Returns the array of creditors contains in the selected subtree
 */
InputReferrerModule.prototype.getCreditors = function(referrer) {
	var that = this;
	if (!Util.checkObject(referrer)) {
		referrer = this.value;
	}
	if (!Util.checkObject(referrer)) {
		return [];
	}
	var creditors = [];
	if(referrer.type == InputReferrerModule.TYPE_CREDITOR) {
		creditors = [referrer];
	} else {
		$.each(referrer.children, function(index, childReferrer) {
			creditors = creditors.concat(that.getCreditors(childReferrer));
		});
	}
	return creditors;
};

/**
 * If only one creditor accessible : selects it
 */
InputReferrerModule.prototype.selectUniqueCreditor = function() {
	var creditors = this.getCreditors(this.rootReferrer);
	if (creditors.length == 1 && creditors[0] !== this.value) {
		this.setValue(creditors[0]);
    	Util.getFunction(this.onSelect)(this.value);
	}
	return this;
};
