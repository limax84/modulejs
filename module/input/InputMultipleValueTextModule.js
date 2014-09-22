/**
 * Class Multiple Value Text Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputMultipleValueTextModule.inherits(InputModule);
function InputMultipleValueTextModule(params) {
	this.parentConstructor(InputModule, params);
	params = Util.getObject(params);
	
	this.setInputLabel(params.inputLabel);
	this.setUnique(params.unique);
	
	// Input module
	var that = this;
	this.inputValue = new InputTextModule({
		'placeholder' : this.placeholder,
		'validationPattern' : this.validationPattern,
		'readonly' : this.readonly,
		'onEnter' : function() { that.inputValue.sendValue(that); }
	});
	this.inputValue.afterJQ = function() {
		this.getJQ().addClass('input-append');
		this.getJQ().find('input').addClass('xlarge-input-append').after($('<span class="add-on"><i class="icon-plus icon"/></span>'));
		this.getJQ().find('i').click(function() { that.inputValue.sendValue(that); });
	};
	this.inputValue.sendValue = function(inputMultipleValueTextModule) {
		inputMultipleValueTextModule.addValue(this.value);
		this.setValue().buildJQ();
		this.getJQ().find('input').focus();
	};
}
	
/** Default values */
InputMultipleValueTextModule.prototype.DEFAULT_VALUES = [];
InputMultipleValueTextModule.prototype.DEFAULT_INPUT_LABEL = I18n.get('add.element');
InputMultipleValueTextModule.prototype.DEFAULT_UNIQUE = false;

/** Concatenated value separator */
InputMultipleValueTextModule.SEP = '&&';

/**
 * Fills the given jQuery element
 */
InputMultipleValueTextModule.prototype.fillJQ = function(jQ) {
	jQ.append($(
		'<span class="columnLeft span6">' +
			'<label>' + this.label + (this.mandatory ? '*' : '') + '</label>' +
			'<div class="values"></div>' +
		'</span>'
	));
	if (!this.readonly) {
		this.inputValue.setLabel($('<span><i class="icon-arrow-left" /> ' + this.inputLabel + '</span>'));
		jQ.append($('<span class="input span6"></span>').append(this.inputValue.buildJQ()));
	}
	this.buildValuesJQ();
	return jQ;
};

/**
 * Clears and fills the values JQ element with the value array
 */
InputMultipleValueTextModule.prototype.buildValuesJQ = function() {
	var that = this;
	var valuesJQ = this.getJQ().find('.values:first');
	valuesJQ.clear();
	$.each(this.values, function(index, value) {
		valuesJQ.append(that.buildValueJQ(index, value));
	});
	if (this.values.length == 0) {
		valuesJQ.append(this.getNoValueJQ());
	}
};

/**
 * Returns a JQ representation of a value
 * @param index of the value
 * @param value
 */
InputMultipleValueTextModule.prototype.buildValueJQ = function(index, value) {
	var that = this;
	var valueModule = new InputTextModule({
		'value' : value,
		'readonly' : this.readonly,
		'validationPattern' : this.validationPattern
	});
	valueModule.afterJQ = function() {
		var it = this;
		this.getJQ().addClass('input-append').attr('index', index);
		this.getJQ().find('input').addClass('xlarge-input-append');
		this.getJQ().find('input').keyup(function(event) {
			that.values[index] = $(this).val();
			that.modified = true;
			Util.getFunction(that.onChange)();
		});
		this.getJQ().find('input').after($('<span class="add-on"><i class="icon-remove icon"/></span>'));
		if (!that.readonly) {
			this.getJQ().find('i').click(function() {
				that.removeValue(it.getJQ().attr('index'));
				that.modified = true;
				Util.getFunction(that.onChange)();
			});
		}
	};
	return valueModule.buildJQ();
};

/**
 * Returns an empty element
 */
InputMultipleValueTextModule.prototype.getNoValueJQ = function() {
	return $('<input type="text" class="input-xlarge gost" disabled="true" placeholder="' + I18n.get('no.element') + '..." />');
};

/**
 * Add a new value to the value array and rebuilds the JQ value list
 */
InputMultipleValueTextModule.prototype.addValue = function(value) {
	if (!Util.checkStringNotEmpty(value)) {
		return this;
	}
	if (Util.checkObject(this.inputValue.validationPattern) && !this.inputValue.validationPattern.regex.test(value)) {
		return this;
	}
	if (this.unique && this.values.contains(value)) {
		return this;
	}
	this.values.push(value);
	this.modified = true;
	Util.getFunction(this.onChange)();
	this.validate();
	this.buildValuesJQ();
	return this;
};

/**
 * Remove a value from the value array and rebuilds the JQ value list
 */
InputMultipleValueTextModule.prototype.removeValue = function(index) {
	this.values.splice(index, 1);
	this.validate();
	this.buildValuesJQ();
	return this;
};

/**
 * Sets the value array and rebuilds the JQ value list
 */
InputMultipleValueTextModule.prototype.setValues = function(values) {
	this.values = values;
	if (!Util.checkArray(this.values)) {
		this.values = $.merge([], this.DEFAULT_VALUES);
	}
	this.buildValuesJQ();
	return this;
};

/**
 * Sets the value array from a concatenated string containing all the values
 * separated by InputMultipleValueTextModule.SEP
 * @param concatenatedValue
 */
InputMultipleValueTextModule.prototype.setValue = function(concatenatedValue) {
	if (!Util.checkString(concatenatedValue)) {
		this.setValues();
		return this;
	}
	this.setValues(concatenatedValue.split(InputMultipleValueTextModule.SEP));
	return this;
};

/**
 * Gets the current concatenated value
 */
InputMultipleValueTextModule.prototype.getValue = function() {
	var concatenatedValue = '';
	$.each(this.values, function(index, value) {
		concatenatedValue += (index != 0 ? InputMultipleValueTextModule.SEP : '') + value;
	});
	return concatenatedValue;
};

/**
 * Sets the validation pattern to the inner InputTextModule
 * @param validationPattern
 */
InputMultipleValueTextModule.prototype.setValidationPattern = function(validationPattern) {
	this.parentMethod(InputModule, 'setValidationPattern', validationPattern);
	if (Util.checkObject(this.inputValue)) {
		this.inputValue.setValidationPattern(validationPattern);
	}
	return this;
};

/**
 * Sets the readonly flag to the inner InputTextModule
 * @param readonly Boolean
 */
InputMultipleValueTextModule.prototype.setReadonly = function(readonly) {
	this.parentMethod(InputModule, 'setReadonly', readonly);
	if (Util.checkObject(this.inputValue)) {
		this.inputValue.setReadonly(readonly);
	}
	return this;
};

/**
 * Sets the input label (the one in front of the input field)
 * @param inputLabel String
 */
InputMultipleValueTextModule.prototype.setInputLabel = function(inputLabel) {
	this.inputLabel = inputLabel;
	if (!Util.checkString(inputLabel)) {
		this.inputLabel = this.DEFAULT_INPUT_LABEL;
	}
	return this;
};

/**
 * Sets the unique values flag
 * @param unique Boolean
 */
InputMultipleValueTextModule.prototype.setUnique = function(unique) {
	this.unique = unique;
	if (!Util.checkBool(unique)) {
		this.unique = this.DEFAULT_UNIQUE;
	}
	return this;
};

/**
 * Executes the validation of the input and check if mandatory
 */
InputMultipleValueTextModule.prototype.validate = function() {
	this.getJQ().removeClass('invalid');
	this.getJQ().attr('title', '');
	if (!this.mandatory) {
		return true;
	}
	if (Util.checkArrayNotEmpty(this.values)) {
		return true;
	}
	this.setInvalid(I18n.get('mandatory.field'));
	return false;
};
