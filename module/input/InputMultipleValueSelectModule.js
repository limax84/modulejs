/**
 * Class Multiple Value Select Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputMultipleValueSelectModule.inherits(InputMultipleValueTextModule);
function InputMultipleValueSelectModule(params) {
	this.parentConstructor(InputMultipleValueTextModule, params);
	params = Util.getObject(params);
	
	// Input module
	var that = this;
	this.inputValue = new InputSelectModule({
		'readonly' : this.readonly,
		'options' : params.options,
		'defaultValue' : params.defaultValue,
		'getText' : params.getText,
		'onEnter' : function() { that.inputValue.sendValue(that); }
	});
	this.inputValue.afterJQ = function() {
		this.getJQ().addClass('input-append');
		this.getJQ().find('select').addClass('xlarge-input-append').after($('<span class="add-on"><i class="icon-plus icon"/></span>'));
		this.getJQ().find('i').click(function() { that.inputValue.sendValue(that); });
	};
	this.inputValue.sendValue = function(inputMultipleValueSelectModule) {
		inputMultipleValueSelectModule.addValue(this.value);
		this.setValue().buildJQ();
		this.getJQ().find('select').focus();
	};

	this.setOptions(params.options);
}

/**
 * Clears and fills the values JQ element with the value array
 */
InputMultipleValueSelectModule.prototype.buildValuesJQ = function() {
	var that = this;
	var valuesJQ = this.getJQ().find('.values:first');
	valuesJQ.clear();
	$.each(this.values, function(index, value) {
		if (Util.check(that.options) && Util.check(that.options[value]))
			valuesJQ.append(that.buildValueJQ(index, value, that.options[value]));
	});
	if (this.values.length == 0) {
		valuesJQ.append(this.getNoValueJQ());
	}
	if (this.unique) {
		var filteredOptions = Object.copy(this.options);
		$.each(this.values, function(index, value) {
			delete filteredOptions[value];
		});
		this.inputValue.setOptions(filteredOptions, true).buildJQ();
	}
};

/**
 * Returns a JQ representation of a value
 * @param index of the value
 * @param value
 */
InputMultipleValueSelectModule.prototype.buildValueJQ = function(index, value, object) {
	var that = this;
	var valueModule = new InputTextModule({
		'value' : this.inputValue.getText(value, object),
		'readonly' : true
	});
	valueModule.afterJQ = function() {
		var it = this;
		this.getJQ().addClass('input-append').attr('index', index);
		this.getJQ().find('input').addClass('xlarge-input-append');
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
 * Sets the input select options
 * @param options
 * @param resetValue Sets value to default if True
 */
InputMultipleValueSelectModule.prototype.setOptions = function(options, resetValue) {
	this.inputValue.setOptions(options, resetValue);
	this.options = this.inputValue.options;
	return this;
};

/**
 * Sets the input select default value
 * First option if default value undefined
 * @param defaultValue
 */
InputMultipleValueSelectModule.prototype.setDefaultValue = function(defaultValue) {
	this.inputValue.setDefaultValue(defaultValue);
	return this;
};

/**
 * Sets the input select getText function
 * @param getText Function
 */
InputMultipleValueSelectModule.prototype.setGetText = function(getText) {
	this.inputValue.setGetText(getText);
	return this;
};
