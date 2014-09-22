/**
 * Class UserModule.
 * 
 * @author Maxime Ollagnier
 */
UserModule.inherits(Module);
function UserModule() {
	var that = this;
	
	/** Inputs modules */
	this.inputEmail = new InputTextModule({
		'label' : I18n.get('email'),
		'placeholder' : I18n.get('email'),
		'validationPattern' : ValidationPattern.VALID_EMAIL,
		'mandatory' : true
	});
	this.inputName = new InputTextModule({
		'label' : I18n.get('name'),
		'placeholder' : I18n.get('name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputFirstName = new InputTextModule({
		'label' : I18n.get('firstName'),
		'placeholder' : I18n.get('firstName'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'rootReferrer' : UserManager.user.referrer,
		'value' : UserManager.user.referrer,
		'mandatory' : true,
		'onSelect' : function() { that.selectReferrer(this.value); }
	});
	this.inputPasswordExpirationDelay = new InputSelectModule({
		'label' : I18n.get('user.passwordExpirationDelay'),
		'options' : EnumManager.PasswordExpirationDelay
	});
	this.inputActive = new InputCheckboxModule({
		'label' : I18n.get('active')
	});
	this.inputGroup = new InputSelectModule({
		'label' : I18n.get('profiles'),
		'options' : UserManager.getGroupMap(UserManager.getUserType(this.inputReferrer.value)),
		'size' : 10,
		'multiple' : true,
		'mandatory' : true,
		'getText' : function(value, group) {
			return group.name;
		},
		'onChange' : function() {
			that.inputRole.setOptions(UserManager.getRoles(this.value));
			that.inputRole.buildJQ();
		}
	});
	this.inputRole = new InputSelectModule({
		'label' : I18n.get('roles'),
		'readonly' : true,
		'size' : 10
	});
	this.inputFlows = new InputMultipleValueSelectModule({
		'label' : I18n.get('user.authorizedFlows'),
		'inputLabel' : I18n.get('user.addFlow'),
		'options' : {},
		'unique' : true,
		'getText' : function(value, object) {
			return object.name;
		}
	});
}

/**
 * Fills the specified jQ
 * @param jQ
 */
UserModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	if (Util.checkObject(this.user)) {
		jQ.append($('<h4>' + I18n.get('user') + '</h4>'));
	} else {
		jQ.append($('<h4>' + I18n.get('user.new') + '</h4>'));
	}
	
	// Form
	var form = $('<div class="form well cropbottom"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputEmail.buildJQ());
	columnLeft.append(this.inputName.buildJQ());
	columnLeft.append(this.inputFirstName.buildJQ());
	columnLeft.append(this.inputGroup.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputReferrer.buildJQ());
	columnRight.append(this.inputPasswordExpirationDelay.buildJQ());
	columnRight.append(this.inputActive.buildJQ());
	columnRight.append(this.inputRole.buildJQ());
	form.append($('<div class="row-fluid">').append(columnLeft).append(columnRight));
	
	var fullWidth = $('<div class="span12"></div>');
	fullWidth.append(this.inputFlows.buildJQ());
	form.append($('<div class="row-fluid">').append(fullWidth));
	
	// Buttons	
	var buttonRow = $('<div></div>');
	jQ.append(buttonRow);

	var buttonRegeneratePassword = $('<div class="btn search">' + I18n.get('user.regeneratePassword') + '</div>');
	buttonRegeneratePassword.click(function() { that.regeneratePassword(); });
	buttonRow.append(buttonRegeneratePassword);

	var buttonSave = $('<div class="btn search">' + I18n.get('save') + '</div>');
	buttonSave.click(function() { that.saveUser(); });
	buttonRow.append(buttonSave);
};


/**
 * Loads the user from server
 * @param callback
 */
UserModule.prototype.loadData = function(callback) {
	var that = this;
	this.user = undefined;
	if (Util.check(this.parameters.id)) {
		AjaxManager.getJSON('getUser', {
			'id' : this.parameters.id
		}, function(result) {
			if (result.success) {
				that.setUser(result.user);
			}
			Util.getFunction(callback)();
		});
	} else {
		this.setUser();
		Util.getFunction(callback)();
	}
};

/**
 * TODO Comment
 */
UserModule.prototype.selectReferrer = function(referrer) {
	var that = this;
	
	// Updates available role groups
	this.inputGroup.setOptions(UserManager.getGroupMap(UserManager.getUserType(referrer)), true).buildJQ();
	
	// Updates available flows
	if (Util.checkObject(referrer)) {
		AjaxManager.getJSON('getAvailableMandateFlows', {
			'referrerId' : referrer.id
		}, function(result) {
			if (result.success) {
				that.inputFlows.setOptions(result.availableMandateFlows).buildJQ();
			}
		});
	}
};

/**
 * TODO Comment
 */
UserModule.prototype.setUser = function(user) {
    this.user = Util.getObject(user);
    
    this.inputEmail.setValue(this.user.email);
	this.inputName.setValue(this.user.name);
	this.inputFirstName.setValue(this.user.firstName);
	this.inputReferrer.setValue(UserManager.getReferrer(this.user.referrerId));
	this.selectReferrer(UserManager.getReferrer(this.user.referrerId));
	this.inputPasswordExpirationDelay.setValue(this.user.passwordExpirationDelay);
	this.inputActive.setValue(this.user.active);
	var userGroupIds = [];
	if (Util.check(this.user.groups)) {
    	for (var i = 0; i < this.user.groups.length; i++) userGroupIds.push(this.user.groups[i].id);
	}
	this.inputGroup.setValue(userGroupIds);
	this.inputRole.setOptions(UserManager.getRoles(userGroupIds));
	var mandateFlowIds = [];
	if (Util.check(this.user.mandateFlows)) {
		$.each(this.user.mandateFlows, function(id, mandateFlow) {
			mandateFlowIds.push(id);
		});
	}
	this.inputFlows.setValues(mandateFlowIds);
};

/**
 * TODO Comment
 */
UserModule.prototype.saveUser = function() {
	if (!this.validate()) {
		return false;
	}
	// User type
	var type = EnumManager.UserType.CREDITOR;
	if (this.inputReferrer.value.type != UserManager.TYPE_CREDITOR) {
		type = EnumManager.UserType.ORGENTITY;
	}
	if (!Util.check(this.inputReferrer.value.parentId)) {
		type = EnumManager.UserType.BACKOFFICE;
	}
	// Parameters
	var params = {
		'id' : this.user.id,
		'email' : this.inputEmail.value,
		'name' : this.inputName.value,
		'firstName' : this.inputFirstName.value,
		'type' : type,
		'active' : this.inputActive.value,
		'passwordExpirationDelay' : this.inputPasswordExpirationDelay.value,
		'referrerId' : this.inputReferrer.value.id
	};
	for (var i = 0; i < this.inputGroup.value.length; i++) {
		params['groupId' + i] = this.inputGroup.value[i];
	}
	for (var i = 0; i < this.inputFlows.values.length; i++) {
		params['mandateFlowId' + i] = this.inputFlows.values[i];
	}
	// Saves user on server
	AjaxManager.getJSON('saveUser', params, function(result) {
		if (result.success) {
		    PopupModule.getInstance().clear();
		    PopupModule.getInstance().show({
		    	'title' : I18n.get('success'),
		    	'content' : I18n.get('user.saved.success'),
		    	'button0' : {
		    		'text' : 'OK'
		    	}
		    });
			NavigationManager.goTo('UserModule?id=' + result.user.id);
		}
	});
};

/**
 * TODO Comment
 */
UserModule.prototype.regeneratePassword = function() {
	PopupModule.getInstance().clear();
	PopupModule.getInstance().show({
    	'title' : I18n.get('confirmation'),
    	'content' : I18n.get('user.regeneratePassword.confirm'),
    	'button1' : {
    		'text' : I18n.get('no')
    	},
    	'button0' : {
    		'text' : I18n.get('yes'),
    		'callback' : function() {
    			AjaxManager.getJSON('regeneratePassword', {}, function(result) {
    				if (result.success) {
    					PopupModule.getInstance().clear();
    					PopupModule.getInstance().show({
    				    	'title' : I18n.get('user.regeneratePassword.success'),
    				    	'content' : I18n.get('user.regeneratePassword.success.desc'),
    				    	'button0' : {
    				    		'text' : 'OK'
    				    	}
    				    });
    				}
    			});
    		}
    	}
    });
};