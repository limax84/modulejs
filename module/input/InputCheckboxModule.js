/**
 * Class Checkbox Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputCheckboxModule.inherits(InputModule);
function InputCheckboxModule(params) {
	params = Util.getObject(params);
	this.parentConstructor(InputModule, params);
	
	this.setPosition(params.position);
}

/** Default values */
InputCheckboxModule.prototype.DEFAULT_VALUE = false;
InputCheckboxModule.prototype.DEFAULT_POSITION = 'right';//possible value : 'right','left'

/**
 * Fills the given jQuery element
 */
InputCheckboxModule.prototype.fillJQ = function(jQ) {
	var label = $('<label></label>').append(this.label);
	var checkbox = $('<div class="input ' + this.widthClass + '"><input type="checkbox"' + (this.value ? ' checked' : '') + (this.readonly ? ' disabled="true"' : '') + ' /></div>');
	if (this.position == "right"){
		jQ.append(label);
		jQ.append(checkbox);
	} else {
		jQ.append(checkbox);
		jQ.append(label);
	}
	var that = this;
	jQ.find('input:first').addClass('change').change(function(event) {
		that.setValue($(this).is(':checked'));
		that.modified = true;
		Util.getFunction(that.onChange).call(that, $(this));
	});
	return jQ;
};

/**
 * Sets the value
 * @param value Boolean
 */
InputCheckboxModule.prototype.setValue = function(value) {
	this.value = value;
	if (!Util.checkBool(value)) {
		this.value = this.DEFAULT_VALUE;
	}
	return this;
};

/**
 * Sets the value
 * @param value Boolean
 */
InputCheckboxModule.prototype.setPosition = function(position) {
	this.position = position;
	if (!Util.checkString(position)) {
		this.position = this.DEFAULT_POSITION;
	}
	return this;
};
