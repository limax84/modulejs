/**
 * Class PasswordChangeModule.
 * 
 * @author Flavio Duboc
 */
PasswordChangeModule.inherits(Module);
function PasswordChangeModule() {
	var that = this;
	this.inputOldPassword = new InputTextModule({
		'label' : I18n.get('change.password.old.password'),
		'placeholder' : I18n.get('change.password.old.password'),
		'validationPattern' : ValidationPattern.VALID_PASSWORD
		// TODO I don't want to verify the password for each input (should be at least for an onblur event) and
		// we should also avoid the side effect of incrementing the password attempts each time
		/** 'validationMethod' : new ValidationMethod({
			'method' : function(value) {
				if (typeof value === "undefined") {
					return true;
				} 
				var isPwdCorrect = false;
				var parameters = {
						'pwd' : Util.getString(value),
				};
				AjaxManager.getJSON('verifyPassword', parameters, function(result) {
					if (result.success) {
						isPwdCorrect = true;
					}
				});
				return isPwdCorrect;
			},
			'errorMessage' : I18n.get('old.password.not.correct')
		}) */
	});
	this.inputNewPassword = new InputTextModule({
		'label' : I18n.get('change.password.new.password'),
		'placeholder' : I18n.get('change.password.new.password'),
		'validationPattern' : ValidationPattern.VALID_PASSWORD,
		'validationMethod' : {
			'validate' : function(value) {
				if (typeof value === "undefined") {
					return true;
				} 
				return (that.inputOldPassword.value != Util.getString(value));
			},
			'errorMessage' : I18n.get('new.password.same.old.password')
		}
	});
	this.inputNewPasswordConfirmation = new InputTextModule({
		'label' : I18n.get('change.password.new.password.confirmation'),
		'placeholder' : I18n.get('change.password.new.password.confirmation'),
		'validationPattern' : ValidationPattern.VALID_PASSWORD,
		'validationMethod' : {
			'validate' : function(value) {
				if (typeof value === "undefined") {
					return true;
				}
				return (that.inputNewPassword.value == Util.getString(value));
			},
			'errorMessage' : I18n.get('new.password.not.confirmed')
		}
	});
}

PasswordChangeModule.prototype.fillJQ = function(jQ) {
	var jQPasswordChange = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(jQPasswordChange);
	
	jQPasswordChange.append(this.inputOldPassword.buildJQ());
	jQPasswordChange.append(this.inputNewPassword.buildJQ());
	jQPasswordChange.append(this.inputNewPasswordConfirmation.buildJQ());	
};

PasswordChangeModule.prototype.submitChange = function(callback) {
	if (!this.validate()) {
		return;
	}
	
	var parameters = {
			'oldpwd' : this.inputOldPassword.value,
			'newpwd' : this.inputNewPassword.value
	};
	
	AjaxManager.postJSON('changeUserPassword', parameters, function(result) {
		Util.getFunction(callback)(result.success, result.userMessageCode);
	});
};