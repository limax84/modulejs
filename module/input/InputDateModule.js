/**
 * Class Date Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputDateModule.inherits(InputTextModule);
function InputDateModule(params) {
	// Sets up params
	this.setParams(params);
}

/** Default values */
InputDateModule.prototype.DEFAULT_VALUE = moment().format('DD/MM/YYYY');
InputDateModule.prototype.DEFAULT_VALIDATION_PATTERN = ValidationPattern.VALID_DATE;
InputDateModule.prototype.DEFAULT_MIN_DATE = moment().subtract('years', 100);
InputDateModule.prototype.DEFAULT_MAX_DATE = moment().add('years', 100);

/**
 * Fills the given jQ element
 * @param jQ
 * @returns jQ
 */
InputDateModule.prototype.fillJQ = function(jQ) {
	this.parentMethod(InputTextModule, 'fillJQ', jQ);
	var that = this;
	
	var jQInput = jQ.find('input');
	jQInput.attr('readonly', true);
	if (this.readonly) {
		jQInput.addClass('readonly');
	} else {
		jQInput.datepicker();
		jQInput.datepicker('option', {'dateFormat' : 'dd/mm/yy'});
		jQInput.datepicker('option', {'minDate' : new Date(this.minDate)});
		jQInput.datepicker('option', {'maxDate' : new Date(this.maxDate)});
		if (Util.checkStringNotEmpty(this.value)){ jQInput.datepicker('setDate', new Date(moment(this.value, 'DD/MM/YYYY'))); }
		jQInput.datepicker('option', {'onSelect' : function() {
			that.value = $(this).val();
			that.validate();
			that.onChange();
		}});
	}
	
	return jQ;
};

/**
 * Sets the value
 * @param value 'DD/MM/YYY' formatted String date
 */
InputDateModule.prototype.setValue = function(value) {
	if (Util.checkString(value) && moment(value, 'DD/MM/YYYY').isValid()) {
		this.value = value;
	}
	else if (Util.checkObject(value) && Util.checkFunction(value.isValid) && value.isValid()) {
		this.value = value.format('DD/MM/YYYY');
	}
	else {
		this.value = this.DEFAULT_VALUE;
	}
	return this;
};

InputDateModule.prototype.getMillis = function() {
	if (Util.checkStringNotEmpty(this.value)){
		return moment(this.value, 'DD/MM/YYYY').valueOf();
	} else {
		return '';
	}
};

/**
 * Sets the minimum Date
 * @param value proper moment() date
 */
InputDateModule.prototype.setMinDate = function(minDate) {
	this.minDate = minDate;
	if (!Util.checkObject(minDate)) {
		this.minDate = this.DEFAULT_MIN_DATE;
	}
};

/**
 * Sets the maximum Date
 * @param value proper moment() date
 */
InputDateModule.prototype.setMaxDate = function(maxDate) {
	this.maxDate = maxDate;
	if (!Util.checkObject(maxDate)) {
		this.maxDate = this.DEFAULT_MAX_DATE;
	}
};

/**
 * Sets the given parameters
 * @param params Parameters
 */
InputDateModule.prototype.setParams = function(params) {
	params = Util.getObject(params);
	this.parentMethod(InputModule, 'setParams', params);
	
	this.setMinDate(params.minDate);
	this.setMaxDate(params.maxDate);
};

/**
 * TODO Comment
 * @returns {Boolean}
 */
InputDateModule.prototype.validate = function() {
	var date = moment(this.value, 'DD/MM/YYYY');
	if (!this.parentMethod(InputTextModule, 'validate') || !date.isValid()) {
		this.setInvalid(I18n.get('invalid.date'));
		return false;
	}
	if (date.diff(this.minDate) <= 0) {
		this.setInvalid(I18n.get('invalid.date.minDate', false, [this.minDate.format('L')]));
		return false;
	}
	if (date.diff(this.maxDate) >= 0) {
		this.setInvalid(I18n.get('invalid.date.maxDate', false, [this.maxDate.format('L')]));
		return false;
	}
	return true;
};