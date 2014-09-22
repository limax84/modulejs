/**
 * Class Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputModule.inherits(Module);
function InputModule(params) {
	// Sets up parameters
	this.setParams(params);
}

/** Default values */
InputModule.prototype.DEFAULT_VALUE = '';
InputModule.prototype.DEFAULT_LABEL = '';
InputModule.prototype.DEFAULT_PLACEHOLDER = '';
InputModule.prototype.DEFAULT_READONLY = false;
InputModule.prototype.DEFAULT_WIDTH_CLASS = 'input-xlarge';
InputModule.prototype.DEFAULT_ON_ENTER = function(){};
InputModule.prototype.DEFAULT_ON_CHANGE = function(){};
InputModule.prototype.DEFAULT_MANDATORY = false;
InputModule.prototype.DEFAULT_ADVISED = false;
InputModule.prototype.DEFAULT_VALIDATION_PATTERN = undefined;
InputModule.prototype.DEFAULT_VALIDATION_METHOD = function(){ return true; };

/**
 * Fills the given jQuery element
 */
InputModule.prototype.fillJQ = function(jQ) {
	throw 'Should be redefined';
};

/**
 * Gets the current value
 */
InputModule.prototype.getValue = function() {
	return this.value;
};

/**
 * Sets the value
 * @param value
 */
InputModule.prototype.setValue = function(value) {
	this.value = value;
	if (!Util.check(value)) {
		this.value = this.DEFAULT_VALUE;
	}
	return this;
};

/**
 * Sets the label
 * @param label
 */
InputModule.prototype.setLabel = function(label) {
	this.label = label;
	if (!Util.check(label)) {
		this.label = this.DEFAULT_LABEL;
	}
	return this;
};

/**
 * Sets the placeholder
 * @param placeholder String
 */
InputModule.prototype.setPlaceholder = function(placeholder) {
	this.placeholder = placeholder;
	if (!Util.checkString(placeholder)) {
		this.placeholder = this.DEFAULT_PLACEHOLDER;
	}
	return this;
};

/**
 * Sets the readonly attribute
 * @param readonly Boolean
 */
InputModule.prototype.setReadonly = function(readonly) {
	this.readonly = readonly;
	if (!Util.checkBool(readonly)) {
		this.readonly = this.DEFAULT_READONLY;
	}
	return this;
};

/**
 * Sets the width class of the input element
 * @param widthClass String ex: 'input-xlarge', 'input-large', 'input-small', etc. (cf. http://twitter.github.com/bootstrap/base-css.html#forms)
 */
InputModule.prototype.setWidthClass = function(widthClass) {
	this.widthClass = widthClass;
	if (!Util.checkString(widthClass)) {
		this.widthClass = this.DEFAULT_WIDTH_CLASS;
	}
	return this;
};

/**
 * Sets the onEnter callback function
 * @param onEnter Function
 */
InputModule.prototype.setOnEnter = function(onEnter) {
	this.onEnter = onEnter;
	if (!Util.checkFunction(onEnter)) {
		this.onEnter = this.DEFAULT_ON_ENTER;
	}
	return this;
};

/**
 * Sets the onChange function
 * @param onChange Function
 */
InputModule.prototype.setOnChange = function(onChange) {
	this.onChange = onChange;
	if (!Util.checkFunction(onChange)) {
		this.onChange = this.DEFAULT_ON_CHANGE;
	}
	return this;
};

/**
 * Sets the mandatory attribute
 * @param mandatory Boolean
 */
InputModule.prototype.setMandatory = function(mandatory) {
	this.mandatory = mandatory;
	if (!Util.checkBool(mandatory)) {
		this.mandatory = this.DEFAULT_MANDATORY;
	}
	return this;
};

/**
 * Sets the advised attribute
 * @param advised Boolean
 */
InputModule.prototype.setAdvised = function(advised) {
	this.advised = advised;
	if (!Util.checkBool(advised)) {
		this.advised = this.DEFAULT_ADVISED;
	}
	return this;
};

/**
 * Sets the validation pattern
 * @param validationPattern
 */
InputModule.prototype.setValidationPattern = function(validationPattern) {
	this.validationPattern = validationPattern;
	if (!Util.checkObject(validationPattern) || Util.getClassName(validationPattern) != 'ValidationPattern') {
		this.validationPattern = this.DEFAULT_VALIDATION_PATTERN;
	}
	return this;
};

/**
 * Sets the validation method
 * @param validationMethod
 */
InputModule.prototype.setValidationMethod = function(validationMethod) {
	this.validationMethod = validationMethod;
	if (!Util.checkObject(validationMethod) || Util.getClassName(validationMethod) != 'ValidationMethod') {
		this.validationMethod = this.DEFAULT_VALIDATION_METHOD;
	}
	return this;
};

/**
 * Sets the given parameters
 * @param params Parameters
 */
InputModule.prototype.setParams = function(params) {
	params = Util.getObject(params);
	
	this.setValue(params.value);
	this.setLabel(params.label);
	this.setPlaceholder(params.placeholder);
	this.setReadonly(params.readonly);
	this.setWidthClass(params.widthClass);
	this.setOnEnter(params.onEnter);
	this.setOnChange(params.onChange);
	this.setMandatory(params.mandatory);
	this.setValidationPattern(params.validationPattern);
	this.setValidationMethod(params.validationMethod);
	this.modified = false;

	return this;
};

/**
 * TODO Merge validations
 * If enabled, executes the validation of the input module and updates the jQ
 */
InputModule.prototype.validate = function() {
	this.getJQ().removeClass('invalid');
	this.getJQ().removeClass('uncompliant');
	this.getJQ().attr('title', '');
	if (!this.validatePattern()) {
		this.setInvalid(this.validationPattern.errorMessage);
		return false;
	}
	if (!this.validateMethod()) {
		this.setInvalid(this.validationMethod.errorMessage);
		return false;
	}
	if (this.mandatory && this.isEmpty()) {
		this.setInvalid(I18n.get('mandatory.field'));
		return false;
	}
	if (this.advised && this.isEmpty()) {
		this.setUncompliant(I18n.get('uncompliant.field'));
	}
	return true;
};

/**
 * Executes pattern validation if :
 *  - the value is a string not empty
 *  - the validationPattern is provided
 */
InputModule.prototype.validatePattern = function() {
	var value = this.value;
	//ensure the value is a string even if it is a number
	if (Util.checkNumber(value)){
		value = "" + value;
	}
	if (!Util.checkStringNotEmpty(value + "")) {
		return true;
	}
	if (!Util.checkObject(this.validationPattern)) {
		return true;
	}
	if (this.validationPattern.regex.test(value)) {
		return true;
	}
	return false;
};

/**
 * Executes pattern validation if :
 *  - the validationMethod is provided
 */
InputModule.prototype.validateMethod = function() {
	if (!Util.checkObject(this.validationMethod)) {
		return true;
	}
	return this.validationMethod.method(this.value);
};

/**
 * Checks if the value is null or empty
 */
InputModule.prototype.isEmpty = function() {
	if (!Util.check(this.value)) {
		return true;
	}
	if (Util.checkString(this.value) && Util.checkStringEmpty(this.value)) {
		return true;
	}
	if (Util.checkArray(this.value) && this.value.length == 0) {
		return true;
	}
	return false;
};

/**
 * Set the module JQ representation to an invalid state
 */
InputModule.prototype.setInvalid = function(errorMessage) {
	this.getJQ().addClass('invalid');
	if (Util.checkString(errorMessage)) {
		this.getJQ().attr('title', errorMessage);
	}
};

/**
 * Set the module JQ representation to an uncompliant state
 */
InputModule.prototype.setUncompliant = function(errorMessage) {
	this.getJQ().addClass('uncompliant');
	if (Util.checkString(errorMessage)) {
		this.getJQ().attr('title', errorMessage);
	}
};
