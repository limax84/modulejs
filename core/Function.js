/**
 * Function.js
 *
 * Extends the Function object.
 *
 * @author Maxime Ollagnier
 */
/**
 * Simulates the class inheritance.
 * N.B. Here "this" is the child class and therefore "this.prototype" its instance representation
 */
Function.prototype.inherits = function(parentClass) {

	// Check if the specified parent class is a function
	if (typeof parentClass != 'function')
		throw new Error('Parent class type must be "function".');
	
	// Initializes the prototype with a new parent instance
	this.prototype = new parentClass();
	
	// Sets back the prototype constructor to itself
	this.prototype.constructor = this;
	
	// Initializes the parent class map if not already defined
	if (typeof this.prototype.parentClass != 'object')
		this.prototype.parentClass = {};
	
	// Adds the parent class mapped by its name
	this.prototype.parentClass[Util.getClassName(parentClass)] = parentClass;

	/**
	 * Calls the constructor of the specified parent class on this object
	 * 
	 * @param parentClass Parent class
	 */
	this.prototype.parentConstructor = function(parentClass) {
		if (typeof parentClass != 'function')
			throw new Error('Parent class missing.');
		if (typeof this.parentClass[Util.getClassName(parentClass)] != 'function')
			throw new Error('Parent class ' + Util.getClassName(parentClass) + ' does not exists in ' + Util.getClassName(this.constructor) + ' inheritance parents stack.');

		this.parentClass[Util.getClassName(parentClass)].apply(this, Array.prototype.slice.call(arguments, 1));
	};

	/**
	 * Call the named method from the specified parent class on this object
	 * 
	 * @param parentClass Parent class
	 * @param methodName Name of the method from specified parent class to call on this object
	 * @param arguments of the method
	 */
	this.prototype.parentMethod = function(parentClass, methodName) {
		if (typeof parentClass != 'function')
			throw new Error('Parent class missing.');
		if (typeof methodName != 'string')
			throw new Error('Method name missing.');
		if (typeof this.parentClass[Util.getClassName(parentClass)] != 'function')
			throw new Error('Parent class ' + Util.getClassName(parentClass) + ' does not exists in ' + Util.getClassName(this.constructor) + ' inheritance parents stack.');
		if (typeof this.parentClass[Util.getClassName(parentClass)].prototype[methodName] != 'function')
			throw new Error('Method ' + methodName + ' does not exist in parent class ' + Util.getClassName(parentClass) + '.');

		return this.parentClass[Util.getClassName(parentClass)].prototype[methodName].apply(this, Array.prototype.slice.call(arguments, 2));
	};

	/**
	 * Returns true if the given parent class exists in the inheritance parent class map
	 * 
	 * @param parentClass Parent class
	 */
	this.prototype.isChildOf = function(parentClass) {
		if (typeof parentClass != 'function')
			return false;
		if (typeof this.parentClass[Util.getClassName(parentClass)] != 'function')
			return false;
		return true;
	};

	/**
	 * Returns true if the given parent class exists in the inheritance parent class map
	 * 
	 * @param parentClass Parent class
	 */
	this.isChildOf = function(parentClass) {
		if (typeof parentClass != 'function')
			return false;
		if (typeof this.prototype.parentClass[Util.getClassName(parentClass)] != 'function')
			return false;
		return true;
	};

	return this;
};

/**
 * Returns the singleton's instance
 */
Function.prototype.getInstance = function() {
	var instanceName = '_instance' + Util.getClassName(this);
	if (!Util.checkObject(this[instanceName])) {
		this[instanceName] = new this();
	}
	return this[instanceName];
};
