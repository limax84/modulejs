/**
 * Class MandateModelModule.
 * 
 * @author Maxime Ollagnier
 */
MandateModelModule.inherits(Module);
function MandateModelModule(params) {
	params = Util.getObject(params);
	this.setReadonly(params.readonly);
	this.initMandateModelTable();
	this.selectLanguage = new InputSelectModule({
		'options' : EnumManager.NaturalLanguage
	});
	this.inputFileModule = new InputFileModule();
}

/** Default values */
MandateModelModule.prototype.DEFAULT_READONLY = false;

MandateModelModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"];
};

MandateModelModule.prototype.fillJQ = function(jQ) {
	var that = this;

	// Mandate models table
	if (this.mandateModelTable.objectMap.size > 0) {
		jQ.append(this.mandateModelTable.buildJQ());
	}
	
	// Mandate model upload
	if (!this.readonly) {
		jQ.append($('<h5>' + I18n.get('mandate.model.upload') + '</h5>'));
		var fileUpload = $('<div class="fileUpload"></div>');
		jQ.append(fileUpload);
		fileUpload.append(this.selectLanguage.buildJQ());
		fileUpload.append(this.inputFileModule.buildJQ());
		fileUpload.append($('<span class="btn send">' + I18n.get('send') + '</span>').click(function() {
			that.uploadMandateModel();
		}));
	}
};

MandateModelModule.prototype.loadData = function(callback) {
	var that = this;
	AjaxManager.getJSON('getMandateModels', {
		'referrerId' : this.parameters.referrerId,
		'mandateFlowId' : this.parameters.mandateFlowId
	}, function(result) {
		that.mandateModelTable.objectMap = new Map();
		if (result.success) {
			$.each(result.mandateModels, function(language, mandateModel) {
				that.mandateModelTable.objectMap.put(that.mandateModelTable.objectMap.size, mandateModel);
			});
		}
		that.mandateModelTable.buildJQ();
		Util.getFunction(callback)();
	});
};

/**
 * Initialization of the mandate model table
 */
MandateModelModule.prototype.initMandateModelTable = function() {
	var that = this;

	// Mandate model table declaration
	this.mandateModelTable = new TableModule();
	this.mandateModelTable.id = 'mandateModelTable';
	
	// Language column definition
	var languageCol = new Column('language', I18n.get('language'), '25%');
	this.mandateModelTable.columnList.push(languageCol);
	languageCol.getText = function(object) {
		return I18n.get('NaturalLanguage.' + object.language);
	};
	
	// Name column definition
	var nameCol = new Column('name', I18n.get('name'), '65%');
	this.mandateModelTable.columnList.push(nameCol);

	// Download column definition
	var downloadCol = new Column('download', '', '5%');
	this.mandateModelTable.columnList.push(downloadCol);
	downloadCol.getAlt = function(object) {
		return I18n.get('download');
	};
	downloadCol.getText = function(object) {
		return $('<i class="icon-download-alt icon"/>').click(function() { that.downloadMandateModel(object); });
	};

	// Remove column definition
	var removeCol = new Column('remove', '', '5%');
	this.mandateModelTable.columnList.push(removeCol);
	removeCol.getAlt = function(object) {
		return I18n.get('remove');
	};
	removeCol.getText = function(object) {
		return $('<i class="icon-remove icon"/>').click(function() { that.removeMandateModel(object); });
	};
};

/**
 * Sets the readonly attribute
 * @param readonly Boolean
 */
MandateModelModule.prototype.setReadonly = function(readonly) {
	this.readonly = readonly;
	if (!Util.checkBool(readonly)) {
		this.readonly = this.DEFAULT_READONLY;
	}
	return this;
};

/**
 * TODO
 * Download the specified file from server
 */
MandateModelModule.prototype.downloadMandateModel = function(mandateModel) {
	AjaxManager.download('downloadMandateModel', {
		'id' : mandateModel.id
	});
};

/**
 * TODO
 * Remove the specified file from server
 */
MandateModelModule.prototype.removeMandateModel = function(mandateModel) {
	var that = this;
	AjaxManager.getJSON('removeMandateModel', {
		'creditorId' : this.parameters.creditorId,
		'mandateFlowId' : this.parameters.mandateFlowId,
		'language' : mandateModel.language
	}, function(result) {
		if (result.success) {
			that.reload();
		}
	});
};

/**
 * TODO
 * Upload selected file to server
 */
MandateModelModule.prototype.uploadMandateModel = function() {
	var that = this;
	if (this.inputFileModule.value != '') {
		this.inputFileModule.submit('uploadMandateModel', {
			'creditorId' : this.parameters.creditorId,
			'mandateFlowId' : this.parameters.mandateFlowId,
			'language' : this.selectLanguage.value
		}, function(result) {
			that.reload();
		});
	}
};