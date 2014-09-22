/**
 * Class Validation
 * 
 * @author Maxime Ollagnier
 */
function Validation(params) {
	params = Util.getObject(params);
	this.setErrorMessage(params.errorMessage);
}

/** Default values */
Validation.prototype.DEFAULT_ERROR_MESSAGE = I18n.get('invalid');

/**
 * Sets the errorMessage
 * @param errorMessage
 */
Validation.prototype.setErrorMessage = function(errorMessage) {
	this.errorMessage = errorMessage;
	if (!Util.checkString(errorMessage)) {
		this.errorMessage = this.DEFAULT_ERROR_MESSAGE;
	}
	return this;
};


/******************************************************************************/

/**
 * Class Validation Method.
 * 
 * @author Maxime Ollagnier
 */
ValidationMethod.inherits(Validation);
function ValidationMethod(params) {
	params = Util.getObject(params);
	this.parentConstructor(Validation, params);
	this.setMethod(params.method);
}

/** Default values */
ValidationMethod.prototype.DEFAULT_METHOD = undefined;

/**
 * Sets the method
 * @param method
 */
ValidationMethod.prototype.setMethod = function(method) {
	this.method = method;
	if (!Util.checkFunction(method)) {
		this.method = this.DEFAULT_METHOD;
	}
	return this;
};


/******************************************************************************/

/**
 * Class Validation Pattern.
 * 
 * @author Maxime Ollagnier
 */
ValidationPattern.inherits(Validation);
function ValidationPattern(params) {
	params = Util.getObject(params);
	this.parentConstructor(Validation, params);
	this.setRegex(params.regex);
}

/** Default values */
ValidationPattern.prototype.DEFAULT_VALID_REGEX = /^.*$/;

/**
 * Sets the regex
 * @param regex
 */
ValidationPattern.prototype.setRegex = function(regex) {
	this.regex = regex;
	if (!Util.checkObject(regex)) {
		this.regex = this.DEFAULT_VALID_REGEX;
	}
	return this;
};

/** Default REGEX : Alphabets, numbers and space and some special characters. min=0, max=60 */
ValidationPattern.VALID_DEFAULT = new ValidationPattern({
	'regex' : /^[A-Za-z0-9 \/\-\?:\(\)\.,]{0,60}$/,
	'errorMessage' : I18n.get('invalid.input')
});
/** Default REGEX for search: Alphabets, numbers and space. No special characters. min=0, max=60 */
ValidationPattern.VALID_DEFAULT_SEARCH = new ValidationPattern({
	'regex' : /^[A-Za-z0-9 \/\-\?:\(\)\.,\*]{0,60}$/,
	'errorMessage' : I18n.get('invalid.input')
});
/** Extended REGEX : Adds double quote to the default pattern */
ValidationPattern.VALID_EXTENDED = new ValidationPattern({
	'regex' : /^[A-Za-z0-9 \/\-\?:\(\)\.,"]{0,60}$/,
	'errorMessage' : I18n.get('invalid.extended')
});
/** Integer REGEX */
ValidationPattern.VALID_INT = new ValidationPattern({
	'regex' : /^[0-9]{0,10}$/,
	'errorMessage' : I18n.get('invalid.integer')
});
/** Email REGEX : Standard email address */
ValidationPattern.VALID_EMAIL = new ValidationPattern({
	'regex' : /^\w+[\w\-\.\+]*\w+@\w+[\w\-]*\w+\.{1}\w{1,99}$/i,
	'errorMessage' : I18n.get('invalid.email')
});
/** Password REGEX : Supports special characters.  min=3, max=20 */
ValidationPattern.VALID_PASSWORD = new ValidationPattern({
	'regex' : /^[A-Za-z0-9àâäéèêëìîïòôöùûü!@#$%^&*()_]{3,20}$/,
	'errorMessage' : I18n.get('invalid.password')
});
/** BIC REGEX */
ValidationPattern.VALID_BIC = new ValidationPattern({
	'regex' : /^([ ]*([a-zA-Z][ ]*){4}([a-zA-Z][ ]*){2}([a-zA-Z0-9][ ]*){2}(([a-zA-Z0-9][ ]*){3})?)$/,
	'errorMessage' : I18n.get('invalid.bic')
});
/** IBAN REGEX */
ValidationPattern.VALID_IBAN = new ValidationPattern({
	'regex' : /^[ ]*([a-zA-Z][ ]*){2}([0-9][ ]*){2}([a-zA-Z0-9][ ]*){4}([0-9][ ]*){7}(([a-zA-Z0-9][ ]*)?){0,16}$/,
	'errorMessage' : I18n.get('invalid.iban')
});
/** Money amount */
ValidationPattern.VALID_AMOUNT = new ValidationPattern({
	'regex' : /^[0-9]{1,8}[\.,]?[0-9]{0,2}$/,
	'errorMessage' : I18n.get('invalid.amount')
});
/** RUM REGEX */
ValidationPattern.VALID_RUM = new ValidationPattern({
	'regex' : /^[A-Za-z0-9 \/\-:\(\)\.,\+]{0,60}$/,
	'errorMessage' : I18n.get('invalid.rum')
});
/** Date validation pattern */
ValidationPattern.VALID_DATE = new ValidationPattern({
	'regex' : /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/((19|20)([0-9][0-9])?)$/,
	'errorMessage' : I18n.get('invalid.date')
});
/** Phone validation pattern */
ValidationPattern.VALID_PHONE_NUMBER = new ValidationPattern({
	'regex' : /^[0-9]{0,13}$/,
	'errorMessage' : I18n.get('invalid.phoneNumber')
});
/** SIREN validation pattern */
ValidationPattern.VALID_SIREN = new ValidationPattern({
	'regex' : /^[0-9]{9}$/,
	'errorMessage' : I18n.get('invalid.siren')
});
/** NNE validation pattern */
ValidationPattern.VALID_NNE = new ValidationPattern({
	'regex' : /^[0-9]{6}$/,
	'errorMessage' : I18n.get('invalid.nne')
});
/** ICS validation pattern */
ValidationPattern.VALID_ICS = new ValidationPattern({
	'regex' : /^[A-Za-z0-9]{13}$/,
	'errorMessage' : I18n.get('invalid.ics')
});
/** Textarea validation pattern : no restriction */
ValidationPattern.VALID_TEXT = new ValidationPattern({
	'regex' : /^.*$/,
	'errorMessage' : I18n.get('invalid.text')
});
/** HHMM (time=hours:minutes) validation pattern */
ValidationPattern.VALID_HHMM = new ValidationPattern({
	'regex' : /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
	'errorMessage' : I18n.get('invalid.hhmm')
});
/** decFIRST (integer[5:30]) validation pattern */
ValidationPattern.VALID_DECFIRST = new ValidationPattern({
	'regex' : /^([5-9]|[1][0-4])$/,
	'errorMessage' : I18n.get('invalid.decFIRST')
});
/** decRECUR (integer[2:30]) validation pattern */
ValidationPattern.VALID_DECRECUR = new ValidationPattern({
	'regex' : /^([2-9]|[1][0-4])$/,
	'errorMessage' : I18n.get('invalid.decRECUR')
});
