/**
 * Class Textarea Input Module.
 * 
 * @author Jean-Luc Scheefer
 */
InputTextAreaModule.inherits(InputTextModule);
function InputTextAreaModule(params) {
	params = Util.getObject(params);
	this.parentConstructor(InputTextModule, params);
	this.setNbRows(params.rows);
	this.setResizeable(params.resizeable);
}

InputTextAreaModule.DEFAULT_ROWS = 5;
InputTextAreaModule.DEFAULT_RESIZEABLE = "none";

/**
 * Fills the given jQuery element
 */
InputTextAreaModule.prototype.fillJQ = function(jQ) {
	jQ.append($('<label></label>').append(this.label).append(this.mandatory ? '*' : ''));
	jQ.append($('<textarea rows="'+this.rows+'" class="' + this.widthClass + '"' + (this.readonly ? ' readonly="true"' : '') + ' style="resize:'+this.resizeable+'">' + this.value.toString() + '</textarea>'));
	var that = this;
	jQ.find('textarea').keyup(function(event) {
		that.setValue($(this).val());
		that.modified = true;
		Util.getFunction(that.onKeyUp)();
		if (that.validate() && event.which == 13) {
			Util.getFunction(that.onEnter)();
		}
	});
	return jQ;
};

InputTextAreaModule.prototype.setNbRows = function(nbRows){
	this.rows = nbRows;
	if (!Util.checkNumber(nbRows)) {
		this.rows = this.DEFAULT_ON_KEY_UP;
	}
	return this;
};

InputTextAreaModule.prototype.setResizeable = function(resize){
	this.resizeable = resize;
	if (!Util.checkStringNotEmpty(resize)) {
		this.resizeable = this.DEFAULT_RESIZEABLE;
	}
	return this;
};
