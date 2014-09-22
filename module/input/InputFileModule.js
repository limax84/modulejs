/**
 * Class File Input Module.
 * 
 * @author Maxime Ollagnier
 */
InputFileModule.inherits(InputModule);
function InputFileModule(params) {
	// Sets up params
	this.setParams(params);
}

/**
 * Fills the given jQuery element
 */
InputFileModule.prototype.fillJQ = function(jQ) {
	jQ.append($('<label></label>').append(this.label).append(this.mandatory ? '*' : ''));
	jQ.append($(
		'<div class="input-append">' +
			'<div class="uneditable-input">' +
				'<i class="icon-file icon"/><span class="filePreview">' + this.value + '</span>' +
			'</div>' +
			'<span class="btn">' +
				'<span>' + I18n.get('file.select') + '</span>' +
				'<input id="file" type="file" name="file">' +
			'</span>' +
		'</div>'
	));
	var that = this;
	jQ.find('.icon:first').click(function() { that.getJQ().find('input:first').click(); });
	jQ.find('input:first').change(function() {
		that.setValue($(this).val().replace('C:\\fakepath\\', ''));
	});
	return jQ;
};

/**
 * Sets the value and updates the jQ
 */
InputFileModule.prototype.setValue = function(value) {
	this.parentMethod(InputModule, 'setValue', value);
	this.getJQ().find('.filePreview').text(this.value);
	return this;
};

/**
 * Sends the file to the URI on the server if a file is selected.
 */
InputFileModule.prototype.submit = function(uri, params, callback) {
	var that = this;
	var oldInputJQ = this.getJQ().find('input:first');
	
	if (Util.checkStringNotEmpty(oldInputJQ.val())) {
		
		// Creates a form for submission
		var formJQ = $('<form method="POST" enctype="multipart/form-data"></form>');
		this.getJQ().append(formJQ);
		
		// Puts the file name as text input in the form
		var fileName = oldInputJQ.val();
		fileName = fileName.substring(fileName.lastIndexOf('\\') + 1);
		fileName = fileName.substring(fileName.lastIndexOf('/') + 1);
		formJQ.append('<input name="fileName" value="' + fileName + '" type="text" />');
		
		// Puts the params as text inputs in the form
		if (Util.checkObject(params)) {
			$.each(params, function(paramName, paramValue) {
				if (Util.check(paramValue) && Util.checkFunction(paramValue.toString)) {
					formJQ.append('<input name="' + paramName + '" value="' + paramValue.toString() + '" type="text" />');
				}
			});
		}
		
		// Replaces the file input by its clone and puts it in the form
		var newInputJQ = oldInputJQ.clone();
		newInputJQ.change(function() { that.setValue($(this).val().replace('C:\\fakepath\\', '')); });
		oldInputJQ.before(newInputJQ);
		formJQ.append(oldInputJQ);
		this.setValue('');
		
		// Submits the form
		AjaxManager.submitForm(uri, formJQ, function(result) {
			formJQ.remove();
			Util.getFunction(callback)(result);
		});
	}
};
