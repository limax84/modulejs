/**
 * Class Module
 * 
 * @author Maxime Ollagnier
 */
function Module() {
};

/** Module id */
Module.prototype.id = undefined;

/** Module jQuery representation */
Module.prototype.jQ = undefined;

/** Module parameters */
Module.prototype.parameters = {};

/**
 * Sets the module parameters, loads the module data, builds
 * the jQ and passes it to the given callback function
 * @returns this for chaining
 */
Module.prototype.load = function(parameters, callback) {
	this.setParameters(parameters);
	var that = this;
	this.loadData(function() {
		Util.getFunction(callback)(that.buildJQ());
	});
	return this;
};

/**
 * Loads the module data. Redefined if needed.
 */
Module.prototype.loadData = function(callback) {
	Util.getFunction(callback)();
};

/**
 * Reloads the module with the same parameters
 * @returns this for chaining
 */
Module.prototype.reload = function(callback) {
	this.load(this.parameters, callback);
	return this;
};

/**
 * Builds the module's jQ within the given tag (or 'div' if omitted)
 */
Module.prototype.buildJQ = function(tag) {
	this.clear();
	var jQ = this.getJQ(tag);
	this.fillJQ(jQ);
	this.afterJQ(jQ);
	this.bind(jQ);
	return jQ;
};

/**
 * Add some jQ building after the standard jQ build. Redefined if needed. Called every jQ built
 */
Module.prototype.afterJQ = function() {
};

/**
 * Contains the action binding of the module. Redefined if needed. Called every jQ built
 */
Module.prototype.bind = function() {
};

/**
 * Clears every bindings of the jQuery element of the module and empties it
 */
Module.prototype.clear = function() {
	this.getJQ().clear();
};

/**
 * Hides the module
 * @returns this for chaining
 */
Module.prototype.hide = function() {
	this.getJQ().hide();
	return this;
};

/**
 * Show the module
 * @returns this for chaining
 */
Module.prototype.show = function() {
	this.getJQ().show();
	return this;
};

/**
 * Returns the jQuery module.
 * If the DOM element already exists it is returned otherwise it is generated.
 * 
 * @param tag if defined, the containing HTML tag of the module. Otherwise : "div"
 */
Module.prototype.getJQ = function(tag) {
	if(Util.checkJQueryNotEmpty(this.jQ) && this.jQ.hasClass(Util.getClassName(this))) {
		return this.jQ;
	}
	if(!Util.check(tag)) {
		tag = 'div';
	}
	this.jQ = $('<' + tag + ' id="' + this.getId() + '"' + ' class="' + Util.getClassName(this) + '"></' + tag + '>');
	this.jQ.data('module', this);
	return this.jQ;
};

/**
 * Returns the HTML id of the module
 */
Module.prototype.getId = function() {
	var id = Util.getClassName(this);
	if(Util.check(this.id)) {
		id = this.id + '-' + id;
	}
	return id;
};

/**
 * Parameters setter.
 * Can be redefined to detect parameter changes
 */
Module.prototype.setParameters = function(parameters) {
	this.parameters = Util.getObject(parameters);
};

/**
 * Static method.
 * Returns the id of the object represented by the specified jQuery element
 */
Module.getElementId = function(jQ) {
	return jQ.attr('id').split('-')[0];
};

/**
 * Static method.
 * Returns the id of the object represented by the parent jQuery element of the specified one
 */
Module.getParentId = function(jQ) {
	return Module.getElementId(jQ.parent());
};

/**
 * TODO Comment
 * @returns {Boolean}
 */
Module.prototype.validate = function() {
	/*if (!Util.checkStringNotEmpty(prefix)) {
		return true;
	}*/
	var valid = true;
	for (attrName in this) {
		if (/*attrName.indexOf(prefix) == 0 && */Util.checkObject(this[attrName]) && Util.checkFunction(this[attrName].validate)) {
			valid = this[attrName].validate() && valid;
		}
	}
	return valid;
};