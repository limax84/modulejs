/**
 * Class Select Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputSelectModule.inherits(InputModule);
function InputSelectModule(params) {
	this.parentConstructor(InputModule, params);
	params = Util.getObject(params);
	
	this.setOptions(params.options);
	this.setSize(params.size);
	this.setMultiple(params.multiple);
	this.setDefaultValue(params.defaultValue);
	this.setGetText(params.getText);
}

/** Default values */
InputSelectModule.DEFAULT_OPTIONS = {};
InputSelectModule.DEFAULT_SIZE = 1;
InputSelectModule.DEFAULT_MULTIPLE = false;
InputSelectModule.DEFAULT_DEFAULT_VALUE = undefined;
InputSelectModule.DEFAULT_GET_TEXT = function(value, object) { return I18n.get(object, true); };

/**
 * Fills the given jQuery element
 */
InputSelectModule.prototype.fillJQ = function(jQ) {
	var that = this;
	jQ.append($('<label></label>').append(this.label).append(this.mandatory ? '*' : ''));
	var jQSelect = $('<select class="' + this.widthClass + ' ' + (this.multiple ? ' multiple' : '') + '"' + (this.size > 1 ? ' size="' + this.size + '"' : '') + (this.multiple ? ' multiple' : '') + (this.readonly ? ' disabled' : '') + '>');
	jQSelect.change(function() {
		that.value = $(this).val();
		that.validate();
		that.modified = true;
		that.onChange.call(that);
	});
	jQSelect.keyup(function(event) {
		if (event.which == 13) {
			Util.getFunction(that.onEnter)(that.value);
		}
	});
	jQ.append($('<div class="input"></div>').append(jQSelect));
	
	var oneSelected = false;
	if (Util.checkArray(that.options)) {
		$.each(this.options, function(index, value) {
			var selected = that.value == value || (Util.checkArray(that.value) && that.value.contains(value));
			jQSelect.append(that.getJQOption(value, value, selected));
			oneSelected = oneSelected || selected;
		});
	} else {
		$.each(this.options, function(value, object) {
			var selected = that.value == value || (Util.checkArray(that.value) && that.value.contains(value));
			jQSelect.append(that.getJQOption(value, object, selected));
			oneSelected = oneSelected || selected;
		});
	}
	if (!oneSelected) {
		if (Util.check(this.defaultValue)) {
			this.value = this.defaultValue;
			jQSelect.prepend(this.getJQOption(this.value, this.value, true));
		} else if(!this.readonly && !this.multiple) {
			this.value = jQSelect.children('option:first').val();
			jQSelect.children('option:first').attr('selected', true);
		}
	}
	
	return jQ;
};

/**
 * Returns the JQ representation of an option
 */
InputSelectModule.prototype.getJQOption = function(value, object, selected) {
	return $('<option value="' + value + '"' + (selected ? ' selected' : '') + (this.readonly ? ' disabled' : '') +'>' + this.getText.call(this, value, object) + '</option>');
};

/**
 * Sets the options
 * @param options
 * @param resetValue Sets value to default if True
 */
InputSelectModule.prototype.setOptions = function(options, resetValue) {
	this.options = options;
	if (!Util.checkObject(options)) {
		this.options = InputSelectModule.DEFAULT_OPTIONS;
	}
	if (Util.checkBoolTrue(resetValue)) {
		this.setValue();
	}
	return this;
};

/**
 * Sets the select size
 * @param size Number
 */
InputSelectModule.prototype.setSize = function(size) {
	this.size = size;
	if (!Util.checkNumber(size)) {
		this.size = InputSelectModule.DEFAULT_SIZE;
	}
	return this;
};

/**
 * Sets the multiple flag
 * @param multiple Boolean
 */
InputSelectModule.prototype.setMultiple = function(multiple) {
	this.multiple = multiple;
	if (!Util.checkBool(multiple)) {
		this.multiple = InputSelectModule.DEFAULT_MULTIPLE;
	}
	return this;
};

/**
 * Sets the default value
 * First option if default value undefined
 * @param defaultValue
 */
InputSelectModule.prototype.setDefaultValue = function(defaultValue) {
	this.defaultValue = defaultValue;
	if (!Util.checkString(defaultValue)) {
		this.defaultValue = InputSelectModule.DEFAULT_DEFAULT_VALUE;
	}
	return this;
};

/**
 * Sets the getText function
 * @param getText Function
 */
InputSelectModule.prototype.setGetText = function(getText) {
	this.getText = getText;
	if (!Util.checkFunction(getText)) {
		this.getText = InputSelectModule.DEFAULT_GET_TEXT;
	}
	return this;
};
