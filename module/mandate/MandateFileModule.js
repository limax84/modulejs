/**
 * Class MandateFileModule.
 * 
 * @author Maxime Ollagnier
 */
MandateFileModule.inherits(Module);
function MandateFileModule() {
	this.initFileTable();
	this.selectFileType = new InputSelectModule({
		'options' : EnumManager.MandateFileType
	});
	this.inputFileModule = new InputFileModule();
}

MandateFileModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"];
};

MandateFileModule.prototype.fillJQ = function(jQ) {

	// File table
	jQ.append($('<h5>' + I18n.get('mandate.attached.files') + '</h5>'));
	jQ.append(this.fileTable.getJQ());
	
	// File upload
	jQ.append($('<h5>' + I18n.get('mandate.upload.file') + '</h5>'));
	var fileUpload = $('<div class="fileUpload"></div>');
	jQ.append(fileUpload);
	fileUpload.append(this.selectFileType.buildJQ());
	fileUpload.append(this.inputFileModule.buildJQ());
	fileUpload.append($('<span class="btn send">' + I18n.get('send') + '</span>'));
	
	// signed mandate download
	jQ.append($('<h5>' + I18n.get('mandate.toSign') + '</h5>'));
	var toSignDownload = $('<div class="toSignDownload well"></div>');
	jQ.append(toSignDownload);
	toSignDownload.append($('<span class="desc">' + I18n.get('mandate.toSign.desc') + ' : </span>'));
	toSignDownload.append($('<i class="icon-download-alt icon"/>'));
};

MandateFileModule.prototype.bind = function(jQ) {
	var that = this;
	jQ.find('.fileUpload').children('.btn:first').click(function() {
		that.uploadFile();
	});
	jQ.find('.toSignDownload').find('.icon:first').click(function() {
		that.downloadToSign();
	});
};

MandateFileModule.prototype.loadData = function(callback) {
	if (Util.check(this.parameters.mandateRum) && Util.check(this.parameters.creditorId)) {
		var that = this;
		AjaxManager.getJSON('getMandateFiles', {
			'mandateRum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId
		}, function(result) {
			that.fileTable.objectMap = new Map();
			if (result.success) {
				for (var i = 0; i < result.files.length; i++) {
					that.fileTable.objectMap.put(that.fileTable.objectMap.size, result.files[i]);
				}
				that.fileTable.objectMap.sort('date', true);
			} else {
				console.error('Failed to load mandate files [rum=' + mandateRum + ']');
			}
			that.fileTable.buildJQ();
		});
	}
	Util.getFunction(callback)();
};

/**
 * Initialization of the file table
 */
MandateFileModule.prototype.initFileTable = function() {
	var that = this;

	// File table declaration
	this.fileTable = new TableModule();
	this.fileTable.id = 'fileTable';
	
	// File type column definition
	var typeCol = new Column('type', I18n.get('file.type'), '25%', true, true);
	this.fileTable.columnList.push(typeCol);
	typeCol.getText = function(object) {
		return I18n.get('MandateFileType.' + object.type);
	};
	
	// File name column definition
	this.fileTable.columnList.push(new Column('name', I18n.get('file.name'), '32%', true));
	
	// Deposit date column definition. Defines special text generation for the column
	var dateCol = new Column('date', I18n.get('deposit.date'), '15%', true);
	this.fileTable.columnList.push(dateCol);
	dateCol.getText = function(object) {
		return moment(object.date).format('DD/MM/YY HH:mm:ss');
	};
	
	// File name column definition
	this.fileTable.columnList.push(new Column('status', I18n.get('status'), '18%', true, true));

	// Download column definition. Defines special text generation for the column
	var downloadCol = new Column('download', '', '5%');
	this.fileTable.columnList.push(downloadCol);
	downloadCol.getAlt = function(object) {
		return I18n.get('download');
	};
	downloadCol.getText = function(object) {
		if (object.status == 'AVAILABLE') {
			return $('<i class="icon-download-alt icon"/>').click(function() { that.downloadFile(object); });
		}
		return $();
	};

	// Remove column definition. Defines special text generation for the column
	var removeCol = new Column('remove', '', '5%');
	this.fileTable.columnList.push(removeCol);
	removeCol.getAlt = function(object) {
		return I18n.get('remove');
	};
	removeCol.getText = function(object) {
		return $('<i class="icon-remove icon"/>').click(function() { that.removeFile(object); });
	};
};

/**
 * Download the specified file from server
 */
MandateFileModule.prototype.downloadFile = function(file) {
	AjaxManager.download('downloadMandateFile', {
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId,
		'mandateFileName' : file.name,
		'mandateFileUri' : file.uri
	});
};

/**
 * Remove the specified file from server
 */
MandateFileModule.prototype.removeFile = function(file) {
	AjaxManager.getJSON('removeMandateFile', {
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId,
		'mandateFileId' : file.id
	}, function(result) {
		if (result.success) {
			MandatePage.getInstance().reload();
		}
	});
};

/**
 * Upload selected file to server
 */
MandateFileModule.prototype.uploadFile = function() {

	if (this.inputFileModule.value != '') {
		this.inputFileModule.submit('uploadMandateFile', {
			'mandateRum' : this.parameters.mandateRum,
			'creditorId' : this.parameters.creditorId,
			'fileType' : this.selectFileType.value
		}, function(result) {
			MandatePage.getInstance().reload();
		});
	}
};

/**
 * Download the mandate to sign from server
 */
MandateFileModule.prototype.downloadToSign = function() {
	AjaxManager.download('downloadMandateToSignFile', {
		'mandateRum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId
	});
};