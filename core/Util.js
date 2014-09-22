/**
 * Provides several utility methods
 * 
 * @author Maxime Ollagnier
 */
function Util() {
}

/** Pattern for email string verification */
Util.EMAIL_PATTERN = /^([A-Za-z0-9_\-\+\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
/** Pattern for login string verification */
Util.LOGIN_PATTERN = /^[A-Za-z0-9_]{5,30}$/;
/** Pattern for hashed password string verification */
Util.HASHED_PASSWORD_PATTERN = /^[0-9a-f]{5,60}$/;

/**
 * Returns the class name or undefined if it's not a valid JavaScript object.
 */
Util.getClassName = function(object) {
	if (Util.checkFunction(object)) {
		return object.toString().match(/^function ([^(]+)/)[1];
	} else if (object && object.constructor && object.constructor.toString) {
		var arr = object.constructor.toString().match(/function\s*(\w+)/);
		if (arr && arr.length == 2) {
			return arr[1];
		}
	} 
	return undefined;
};

/**
 * Returns true if all the parameters exist and are not null
 */
Util.check = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] == 'undefined' || arguments[i] === null) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are null
 */
Util.checkNull = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] == 'undefined' || arguments[i] != null) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'string'
 */
Util.checkString = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'string') {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist, are typified as 'string' and are
 * not empty strings
 */
Util.checkStringNotEmpty = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'string' || arguments[i].length == 0) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist, are typified as 'string' and are
 * empty strings
 */
Util.checkStringEmpty = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'string' || arguments[i].length > 0) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'number'
 */
Util.checkNumber = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'number' || arguments[i] == null) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'boolean'
 */
Util.checkBool = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'boolean' || arguments[i] == null) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist, are typified as 'boolean' and are equal to true
 */
Util.checkBoolTrue = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'boolean' || arguments[i] == null || arguments[i] !== true) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist, are typified as 'boolean' and are equal to false
 */
Util.checkBoolFalse = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'boolean' || arguments[i] == null || arguments[i] !== false) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'array'
 */
Util.checkArray = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'object' || arguments[i] == null || Object.prototype.toString.call(arguments[i]) != '[object Array]') {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'array' and are not empty
 */
Util.checkArrayNotEmpty = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'object' || arguments[i] == null || Object.prototype.toString.call(arguments[i]) != '[object Array]' || arguments[i].length == 0) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'object'
 */
Util.checkObject = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'object' || arguments[i] == null) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are typified as 'function'
 */
Util.checkFunction = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'function' || arguments[i] == null) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and have the specified class name
 */
Util.checkClassName = function(className) {
	for ( var i = 1; i < arguments.length; i++) {
		if (!Util.checkObject(arguments[i]) || Util.getClassName(arguments[i]) != className) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are correct email strings
 */
Util.checkEmail = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'string' || !Util.EMAIL_PATTERN.test(arguments[i])) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are correct login strings
 */
Util.checkLogin = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'string' || !Util.LOGIN_PATTERN.test(arguments[i])) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are correct hashed password
 * strings
 */
Util.checkPassword = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] != 'string' || !Util.HASHED_PASSWORD_PATTERN.test(arguments[i])) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are JQuery objects
 */
Util.checkJQuery = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (!(arguments[i] instanceof jQuery)) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if all the parameters exist and are non-empty JQuery objects
 */
Util.checkJQueryNotEmpty = function() {
	for ( var i = 0; i < arguments.length; i++) {
		if (!(arguments[i] instanceof jQuery) || arguments[i].length <= 0) {
			return false;
		}
	}
	return true;
};

/**
 * Checks if the argument "arg" is a String. If it is the argument is returned
 * otherwise the method returns an empty String. A warning message can be pass.
 */
Util.getString = function(arg, warnMessage) {
	if (Util.checkString(arg)) {
		return arg;
	}
	if (Util.checkString(warnMessage)) {
		console.warn(warnMessage);
	}
	return '';
};

/**
 * Checks if the argument "arg" is a function. If it is the argument is returned
 * otherwise the method returns an empty function. A warning message can be pass.
 */
Util.getFunction = function(arg, warnMessage) {
	if (Util.checkFunction(arg)) {
		return arg;
	}
	if (Util.checkString(warnMessage)) {
		console.warn(warnMessage);
	}
	return function() {};
};

/**
 * Checks if the argument "arg" is an object. If it is the argument is returned
 * otherwise the method returns an empty object. A warning message can be pass.
 */
Util.getObject = function(arg, warnMessage) {
	if (Util.checkObject(arg)) {
		return arg;
	}
	if (Util.checkString(warnMessage)) {
		console.warn(warnMessage);
	}
	return {};
};

/**
 * Checks if the argument "arg" is an array. If it is the argument is returned
 * otherwise the method returns an empty array. A warning message can be pass.
 */
Util.getArray = function(arg, warnMessage) {
	if (Util.checkArray(arg)) {
		return arg;
	}
	if (Util.checkString(warnMessage)) {
		console.warn(warnMessage);
	}
    return [];
};

/**
 * Returns true if the statement equals the expected value,
 * otherwise, throws an exception with the given message.
 */
Util.assertThrow = function(statement, expectedValue, message) {
	var msg = message;
	if (!Util.checkString(msg)) {
		msg = 'Assertion failed.';
	}
	if (statement != expectedValue) {
		throw msg;
	}
	return true;
};

/**
 * Returns true if the statement equals the expected value,
 * otherwise, logs the given message as an Error and returns false.
 */
Util.assertError = function(statement, expectedValue, message) {
	var msg = message;
	if (!Util.checkString(msg)) {
		msg = 'Assertion failed.';
	}
	if (statement != expectedValue) {
		console.error(msg);
		return false;
	}
	return true;
};

/**
 * Returns true if the statement equals the expected value,
 * otherwise, logs the given message as a Warning and returns false.
 */
Util.assertWarn = function(statement, expectedValue, message) {
	var msg = message;
	if (!Util.checkString(msg)) {
		msg = 'Assertion failed.';
	}
	if (statement != expectedValue) {
		console.warn(msg);
		return false;
	}
	return true;
};
