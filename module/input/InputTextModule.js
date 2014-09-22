/**
 * Class Text Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputTextModule.inherits(InputModule);
function InputTextModule(params) {
	params = Util.getObject(params);
	this.parentConstructor(InputModule, params);
	this.setOnKeyUp(params.onKeyUp);
	this.setPassworded(params.passworded);
}

/** Default values */
InputTextModule.prototype.DEFAULT_ON_KEY_UP = function(){};
InputTextModule.prototype.DEFAULT_PASSWORDED = false;

/**
 * Fills the given jQuery element
 */
InputTextModule.prototype.fillJQ = function(jQ) {
	jQ.append($('<label></label>').append(this.label).append(this.mandatory ? '*' : ''));
	jQ.append($('<div class="input"><input type="'+ (this.passworded ? 'password' : 'text') +'" placeholder="' + this.placeholder + '" class="' + this.widthClass + '" value="' + this.value.toString().replace(/"/g, '&quot;') + '"' + (this.readonly ? ' readonly="true"' : '') + '></div>'));
	var that = this;
	jQ.find('input:first').keyup(function(event) {
		that.setValue($(this).val());
		that.modified = true;
		Util.getFunction(that.onKeyUp)(that.value, event.which);
		if (that.validate() && event.which == 13) {
			Util.getFunction(that.onEnter)(that.value);
		}
	});
	return jQ;
};

/**
 * Sets the onKeyUp callback function
 * 
 * @param onKeyUp Function
 */
InputTextModule.prototype.setOnKeyUp = function(onKeyUp) {
	this.onKeyUp = onKeyUp;
	if (!Util.checkFunction(onKeyUp)) {
		this.onKeyUp = this.DEFAULT_ON_KEY_UP;
	}
	return this;
};

/**
 * Sets the passworded field
 * @param pwded boolean, true if this input text is a password, false otherwise
 */
InputTextModule.prototype.setPassworded = function(pwded) {
	this.passworded = pwded;
	if (!Util.checkBool(pwded)) {
		this.passworded = this.DEFAULT_PASSWORDED;
	}
	return this;
};
