/**
 * Class ScheduleModule.
 * 
 * @author Maxime Ollagnier
 */
ScheduleModule.inherits(Module);
function ScheduleModule() {
	
	/** Inputs modules */
	this.inputName = new InputTextModule({
		'label' : I18n.get('schedule.name'),
		'placeholder' : I18n.get('schedule.name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true
	});
	this.inputAmount = new InputTextModule({
		'label' : I18n.get('amount'),
		'placeholder' : I18n.get('amount'),
		'validationPattern' : ValidationPattern.VALID_AMOUNT,
		'mandatory' : true
	});
	this.inputAmount.afterJQ = function() {
		this.getJQ().addClass('input-append');
		this.getJQ().find('input').addClass('xlarge-input-append').after($('<span class="add-on">€</span>'));
	};
	this.inputStartDate = new InputDateModule({
		'label' : I18n.get('schedule.startDate'),
		'value' : moment().add('months', 1).add('days', 1).format('L'),
		'minDate' : moment().add('months', 1),
		'mandatory' : true
	});
	this.inputOrderNb = new InputTextModule({
		'label' : I18n.get('order.nb'),
		'placeholder' : I18n.get('order.nb'),
		'validationPattern' : ValidationPattern.VALID_INT,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.selectPeriod = new InputSelectModule({
		'label' : I18n.get('schedule.period'),
		'options' : EnumManager.SchedulePeriod
	});
}

ScheduleModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"]; // TODO
};

/**
 * Fills the specified jQ
 * @param jQ
 */
ScheduleModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Checks if a mandate is selected
	if (!Util.checkString(this.parameters.mandateRum) || !Util.checkString(this.parameters.creditorId)) {
		console.error('Cannot create a new schedule without a mandate selected');
		return;
	}
	
	// Title
	jQ.append($('<h4>' + I18n.get('schedule.new') + '</h4>'));
	
	var form = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(form);
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputName.buildJQ());
	columnLeft.append(this.inputAmount.buildJQ());
	columnLeft.append(this.inputStartDate.buildJQ());
	form.append(columnLeft);
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputOrderNb.buildJQ());
	columnRight.append(this.selectPeriod.buildJQ());
	form.append(columnRight);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	jQ.append(buttonRow);
	
	var buttonSave = $('<div class="btn search">' + I18n.get('save') + '</div>');
	buttonSave.click(function() { that.saveSchedule(); });
	buttonRow.append(buttonSave);
};

/**
 * TODO Comment
 */
ScheduleModule.prototype.saveSchedule = function(callback) {
	var that = this;
	
	// Checks if a mandate is selected
	if (!Util.checkString(this.parameters.mandateRum) || !Util.checkString(this.parameters.creditorId)) {
		console.error('Cannot create a new schedule without a mandate selected');
		return false;
	}
	
	// Validates the form
	if (!this.validate()) {
		return false;
	}
	
	AjaxManager.getJSON('saveSchedule', {
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId,
		'name' : this.inputName.value,
		'amount' : parseFloat(this.inputAmount.value) * 100,
		'period' : this.selectPeriod.value,
		'orderNb' : parseInt(this.inputOrderNb.value),
		'startDate' : moment(this.inputStartDate.value, 'DD/MM/YYYY').valueOf()
	}, function(result) {
		if (result.success) {
			that.reload(function() {
			    alert(I18n.get('schedule.saved'));
			    Util.getFunction(callback)();
			});
		}
	});
	return true;
};