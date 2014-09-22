/**
 * Class CreditorInfoModule.
 * 
 * @author Jean-Luc Scheefer
 */
CreditorInfoModule.inherits(Module);
function CreditorInfoModule() {
	var that = this;
	
	/** -------------------------------- */
	/** create collapsible creditor info */
	this.infosCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.info.info') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'collapsed' : false,
		'effect' : 'none'
	});
	/** Input Modules for infos */
	this.infosCollapsible.inputSocialName = new InputTextModule({
		'label' : I18n.get('creditor.info.socialTitle.label'),
		'placeholder' : I18n.get('creditor.info.socialTitle.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputCommercialName = new InputTextModule({
		'label' : I18n.get('creditor.info.commercialTitle.label'),
		'placeholder' : I18n.get('creditor.info.commercialTitle.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputLegalForm = new InputTextModule({
		'label' : I18n.get('creditor.info.legalForm.label'),
		'placeholder' : I18n.get('creditor.info.legalForm.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	this.infosCollapsible.inputSiren = new InputTextModule({
		'label' : I18n.get('creditor.info.siren.label'),
		'placeholder' : I18n.get('creditor.info.siren.placeholder'),
		'validationPattern' : ValidationPattern.VALID_SIREN,
		'widthClass' : 'input-large'
	});
	this.infosCollapsible.inputActivity = new InputTextModule({
		'label' : I18n.get('creditor.info.activity.label'),
		'placeholder' : I18n.get('creditor.info.activity.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	this.infosCollapsible.inputNne = new InputTextModule({
		'label' : I18n.get('creditor.info.nne.label'),
		'placeholder' : I18n.get('creditor.info.nne.label'),
		'validationPattern' : ValidationPattern.VALID_INT,
		'widthClass' : 'input-large'
	});
	this.infosCollapsible.inputIcs = new InputTextModule({
		'label' : I18n.get('creditor.info.ics.label'),
		'placeholder' : I18n.get('creditor.info.ics.label'),
		'validationPattern' : ValidationPattern.VALID_ICS,
		'onKeyUp' : function() {
			var tf = that.infosCollapsible.inputIcs.getJQ().find('input:first');
			tf.val(tf.val().toUpperCase());
		},
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputParent = new InputReferrerModule({
		'selectableType' : InputReferrerModule.TYPE_ENTITY,
		'label' : I18n.get('creditor.info.topEntity.label'),
		'rootReferrer' : UserManager.user.referrer,
		'widthClass' : 'large-input',
		'mandatory' : true
	});
	this.infosCollapsible.inputEmail = new InputTextModule({
		'label' : I18n.get('creditor.info.email.label'),
		'placeholder' : I18n.get('creditor.info.email.label'),
		'validationPattern' : ValidationPattern.VALID_EMAIL,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputPhone = new InputTextModule({
		'label' : I18n.get('creditor.info.phoneNumber.label'),
		'placeholder' : I18n.get('creditor.info.phoneNumber.placeholder'),
		'validationPattern' : ValidationPattern.VALID_PHONE_NUMBER,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputAddress1 = new InputTextModule({
		'label' : I18n.get('creditor.info.address1.label'),
		'placeholder' : I18n.get('creditor.info.address1.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputAddress2 = new InputTextModule({
		'label' : I18n.get('creditor.info.address2.label'),
		'placeholder' : I18n.get('creditor.info.address2.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	this.infosCollapsible.inputZip = new InputTextModule({
		'label' : I18n.get('creditor.info.zipCode.label'),
		'placeholder' : I18n.get('creditor.info.zipCode.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputCity = new InputTextModule({
		'label' : I18n.get('creditor.info.city.label'),
		'placeholder' : I18n.get('creditor.info.city.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large',
		'mandatory' : true
	});
	this.infosCollapsible.inputCountry = new InputSelectModule({
		'label' : I18n.get('creditor.info.country.label'),
		'options' : Object.sortByValue(Countries.getAll()),
        'value' : 'FR',
		'widthClass' : 'input-large'
	});
	
	/** ------------------------------------------ */
	/** Create collapsible creditor RUM parameters */
	this.rumParametersCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.info.paramsRUM') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'effect' : 'none'
	});
	/** Input Modules for RUM parameters */
	this.rumParametersCollapsible.inputRumCreation = new InputSelectModule({
		'label' : I18n.get('creditor.params.rumCreation.label'),
		'options' : EnumManager.RumGenerator,
		'widthClass' : 'input-large'
	});
	this.rumParametersCollapsible.inputRumPrefix = new InputSelectModule({
		'label' : I18n.get('creditor.params.rumPrefix.label'),
		/*'options' : ,*/ //Set in setCreditor method
		'widthClass' : 'input-large'
	});
	
	/** -------------------------------------------------------- */
	/** Create collapsible creditor mandate model (COMMING SOON) */
	/*var addModelCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.info.addModel') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'effect' : 'none'
	});*/
	
	/** -------------------------------------------- */
	/** Create collapsible creditor remit parameters */
	this.remitParamsCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.info.params') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'effect' : 'none'
	});
	/** Input Modules for remit parameters */
	this.remitParamsCollapsible.inputRemitMode = new InputSelectModule({
		'label' : I18n.get('creditor.params.remitMode.label'),
		'options' : EnumManager.RemittanceMode,
		'widthClass' : 'input-large'
	});
	this.remitParamsCollapsible.inputRemitFrequency = new InputSelectModule({
		'label' : I18n.get('creditor.params.remitFrequency.label'),
		'options' : EnumManager.ScheduleType,
		'widthClass' : 'input-large',
		'onChange' : function() { that.remitFrequencyChanged(); }
	});
	this.remitParamsCollapsible.inputDay = new InputSelectModule({
		'label' : I18n.get('creditor.params.day.label', false, [""]),
		'options' : EnumManager.ScheduleDay,
		'widthClass' : 'input-large'
	});
	this.remitParamsCollapsible.inputCutoffBankTime = new InputTextModule({
		'label' : I18n.get('creditor.params.cutoff.label'),
		'placeholder' : I18n.get('HHMM'),
		'validationPattern' : ValidationPattern.VALID_HHMM,
		'widthClass' : 'input-large',
		'value' : '1700'
	});
	this.remitParamsCollapsible.inputCutoffFirst = new InputTextModule({
		'label' : I18n.get('creditor.params.cutoffFirst.label'),
		'placeholder' : I18n.get('creditor.params.cutoffFirst.placeholder'),
		'validationPattern' : ValidationPattern.VALID_DECFIRST,
		'widthClass' : 'input-large',
		'value' : 5,
		'mandatory' : true
	});
	this.remitParamsCollapsible.inputCutoffRecur = new InputTextModule({
		'label' : I18n.get('creditor.params.cutoffRecur.label'),
		'placeholder' : I18n.get('creditor.params.cutoffRecur.placeholder'),
		'validationPattern' : ValidationPattern.VALID_DECRECUR,
		'widthClass' : 'input-large',
		'value' : 2,
		'mandatory' : true
	});
	this.remitParamsCollapsible.inputRemitInformations = new InputTextAreaModule({
		'rows' : 4,
		'resizeable' : 'vertical',
		'widthClass' : 'cpc-width',
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	
	/** ------------------------------------------------ */
	/** Create collapsible creditor Contralia parameters */
	this.contraliaParamsCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('creditor.info.paramscontralia') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'effect' : 'none'
	});
	/** Input Modules for Contralia parameters */
	this.contraliaParamsCollapsible.inputContraliaUser = new InputTextModule({
		'label' : I18n.get('creditor.paramscontralia.user.label'),
		'placeholder' : I18n.get('creditor.paramscontralia.user.placeholder'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	this.contraliaParamsCollapsible.inputContraliaPwd = new InputTextModule({
		'label' : I18n.get('creditor.paramscontralia.pwd.label'),
		'placeholder' : I18n.get('creditor.paramscontralia.pwd.placeholder'),
		'validationPattern' : ValidationPattern.VALID_PASSWORD,
		'widthClass' : 'input-large',
		'passworded' : true
	});
	this.contraliaParamsCollapsible.inputContraliaDistrib = new InputTextModule({
		'label' : I18n.get('creditor.paramscontralia.distrib.label'),
		'placeholder' : I18n.get('creditor.paramscontralia.distrib.placeholder'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	this.contraliaParamsCollapsible.inputContraliaOffer = new InputTextModule({
		'label' : I18n.get('creditor.paramscontralia.offer.label'),
		'placeholder' : I18n.get('creditor.paramscontralia.offer.placeholder'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	this.contraliaParamsCollapsible.inputContraliaProvider = new InputTextModule({
		'label' : I18n.get('creditor.paramscontralia.provider.label'),
		'placeholder' : I18n.get('creditor.paramscontralia.provider.placeholder'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'widthClass' : 'input-large'
	});
	
	/** ------------------------------------------ */
	/** Create collapsible creditor mandate models */
	this.mandateModelCollapsible = new CollapsibleModule({
		'title' : $('<h5>' + I18n.get('mandate.models') + '</h5>'),
		'showCollapsibleIcon' : 'prepend',
		'effect' : 'none'
	});
	/** Mandate model module */
	this.mandateModelCollapsible.mandateModels = new MandateModelModule();
	
}

CreditorInfoModule.DAY_RANGE = [1, 29];

CreditorInfoModule.neededRoles = function() {
	return ['ROLE_USER', 'VIEW_CREDITOR'];
};

CreditorInfoModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Creditor info
	var jQCreditorInfo = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.infosCollapsible.inputSocialName.buildJQ());
	columnLeft.append(this.infosCollapsible.inputCommercialName.buildJQ());
	columnLeft.append(this.infosCollapsible.inputLegalForm.buildJQ());
	columnLeft.append(this.infosCollapsible.inputSiren.buildJQ());
	columnLeft.append(this.infosCollapsible.inputActivity.buildJQ());
	columnLeft.append(this.infosCollapsible.inputNne.buildJQ());
	columnLeft.append(this.infosCollapsible.inputIcs.buildJQ());
	
	if (this.creditor != UserManager.user.referrer) {
		//only displayed for entity
		columnLeft.append(this.infosCollapsible.inputParent.buildJQ());
	} else {
		this.infosCollapsible.inputParent.setMandatory(false);
	}
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.infosCollapsible.inputEmail.buildJQ());
	columnRight.append(this.infosCollapsible.inputPhone.buildJQ());
	columnRight.append(this.infosCollapsible.inputAddress1.buildJQ());
	columnRight.append(this.infosCollapsible.inputAddress2.buildJQ());
	columnRight.append(this.infosCollapsible.inputZip.buildJQ());
	columnRight.append(this.infosCollapsible.inputCity.buildJQ());
	columnRight.append(this.infosCollapsible.inputCountry.buildJQ());
	jQCreditorInfo.append(columnLeft).append(columnRight);
	//create collapsible creditor info
	this.infosCollapsible.setContent(jQCreditorInfo);
	jQ.append(this.infosCollapsible.buildJQ());
	
	
	//creditor parameters RUM
	var jQCreditorParamsRUM = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.rumParametersCollapsible.inputRumCreation.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.rumParametersCollapsible.inputRumPrefix.buildJQ());
	jQCreditorParamsRUM.append(columnLeft).append(columnRight);
	this.rumParametersCollapsible.setContent(jQCreditorParamsRUM);
	jQ.append(this.rumParametersCollapsible.buildJQ());
	//if this creditor has no prefix, disable rum prefix input
	if (jQuery.isEmptyObject(this.rumParametersCollapsible.inputRumPrefix.options)){
		this.rumParametersCollapsible.inputRumPrefix.getJQ().find('select').attr('disabled','disabled');
		this.rumParametersCollapsible.inputRumPrefix.buildJQ();
	}
	
	
	//Creditor parameters remit
	var jQCreditorParamsMandate = $('<div class="form well cropbottom row-fluid"></div>');
	var columnLeft = $('<div class="span6"></div>');
	this.remitParamsCollapsible.inputRemitMode.setReadonly(Util.checkObject(this.creditor));
	columnLeft.append(this.remitParamsCollapsible.inputRemitMode.buildJQ());
	columnLeft.append(this.remitParamsCollapsible.inputRemitFrequency.buildJQ());
	if (Util.checkObject(this.creditor)) {
		this.remitFrequencyChanged(this.creditor.remitDay);
	}
	columnLeft.append(this.remitParamsCollapsible.inputDay.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.remitParamsCollapsible.inputCutoffBankTime.buildJQ());
	columnRight.append(this.remitParamsCollapsible.inputCutoffFirst.buildJQ());
	columnRight.append(this.remitParamsCollapsible.inputCutoffRecur.buildJQ());
	jQCreditorParamsMandate.append(columnLeft).append(columnRight);
	var infoSup = $('<div style="clear:both;text-align:left;margin-top:3px;"></div>');
	infoSup.append(I18n.get('creditor.paramscontralia.remitInfo.label') + '<br/>');
	infoSup.append(this.remitParamsCollapsible.inputRemitInformations.buildJQ());
	jQCreditorParamsMandate.append(infoSup);
	this.remitParamsCollapsible.setContent(jQCreditorParamsMandate);
	jQ.append(this.remitParamsCollapsible.buildJQ());
	
	
	//Creditor parameters contralia
	if (UserManager.hasRoles(['MANAGE_CREDITOR_CONTRACT'])) {
		var jQCreditorParamsContralia = $('<div class="form well cropbottom row-fluid"></div>');
		var columnLeft = $('<div class="span6"></div>');
		columnLeft.append(this.contraliaParamsCollapsible.inputContraliaUser.buildJQ());
		columnLeft.append(this.contraliaParamsCollapsible.inputContraliaPwd.buildJQ());
		columnLeft.append(this.contraliaParamsCollapsible.inputContraliaDistrib.buildJQ());
		columnLeft.append(this.contraliaParamsCollapsible.inputContraliaOffer.buildJQ());
		columnLeft.append(this.contraliaParamsCollapsible.inputContraliaProvider.buildJQ());
		jQCreditorParamsContralia.append(columnLeft);
		this.contraliaParamsCollapsible.setContent(jQCreditorParamsContralia);
		jQ.append(this.contraliaParamsCollapsible.buildJQ());
	}
	
	// Footer
	var jQCreditorFooterMandatory = $('<p style="text-align:right;">' + I18n.get('mandate.footer.mandatory.fields') + '</p>');
	jQ.append(jQCreditorFooterMandatory);
	
	if (UserManager.hasRoles(['MANAGE_CREDITOR'])) {
		var jQCreditorSaveButton = $('<div class="btn-row"><button class="creditor-save-btn">' + I18n.get('save') + '</button></div>');	
		jQCreditorSaveButton.click(function() { that.saveCreditorInfo(); });
		jQ.append(jQCreditorSaveButton);
	}
};

CreditorInfoModule.prototype.setCreditor = function(creditor) {
	this.creditor = creditor;
	if (!Util.checkObject(this.creditor)) {
		return;
	}
	//fill creditor info
	this.infosCollapsible.inputSocialName.setValue(this.creditor.name);
	this.infosCollapsible.inputCommercialName.setValue(this.creditor.commercialName);
	this.infosCollapsible.inputLegalForm.setValue(this.creditor.legalForm);
	this.infosCollapsible.inputSiren.setValue(this.creditor.siren);
	this.infosCollapsible.inputActivity.setValue(this.creditor.activity);
	this.infosCollapsible.inputNne.setValue(this.creditor.nne);
	this.infosCollapsible.inputIcs.setValue(this.creditor.ics);
	this.infosCollapsible.inputParent.setValue(UserManager.getReferrer(this.creditor.parentId));
	this.infosCollapsible.inputEmail.setValue(this.creditor.email);
	this.infosCollapsible.inputPhone.setValue(this.creditor.phone);
	this.infosCollapsible.inputAddress1.setValue(this.creditor.address1);
	this.infosCollapsible.inputAddress2.setValue(this.creditor.address2);
	this.infosCollapsible.inputZip.setValue(this.creditor.zipCode);
	this.infosCollapsible.inputCity.setValue(this.creditor.city);
	this.infosCollapsible.inputCountry.setValue(this.creditor.country);
	
	
	//fill creditor Rum parameters
	var options = new Object();
	for (var i=0;i<this.creditor.rumPrefixes.length;i++){
		var s = this.creditor.rumPrefixes[i];
		options[s] = s;
	}
	this.rumParametersCollapsible.inputRumCreation.setValue(this.creditor.rumCreation);
	this.rumParametersCollapsible.inputRumPrefix.setOptions(options);
	this.rumParametersCollapsible.inputRumPrefix.setValue(this.creditor.rumPrefix);
	
	//fill creditor remit parameters
	this.remitParamsCollapsible.inputRemitMode.setValue(this.creditor.remitMode);
	this.remitParamsCollapsible.inputRemitFrequency.setValue(this.creditor.remitFreq);
	this.remitParamsCollapsible.inputDay.setValue(this.creditor.remitDay);
	this.remitParamsCollapsible.inputCutoffBankTime.setValue(this.creditor.cutOffHour);
	this.remitParamsCollapsible.inputCutoffFirst.setValue(this.creditor.remitoffsetFirst);
	this.remitParamsCollapsible.inputCutoffRecur.setValue(this.creditor.remitoffsetRecurrent);
	this.remitParamsCollapsible.inputRemitInformations.setValue(this.creditor.remitInfo);
	
	//fill creditor contralia parameters
	this.contraliaParamsCollapsible.inputContraliaUser.setValue(this.creditor.contraliaUser);
	this.contraliaParamsCollapsible.inputContraliaPwd.setValue(this.creditor.contraliaPwd);
	this.contraliaParamsCollapsible.inputContraliaDistrib.setValue(this.creditor.contraliaDist);
	this.contraliaParamsCollapsible.inputContraliaOffer.setValue(this.creditor.contraliaOffer);
	this.contraliaParamsCollapsible.inputContraliaProvider.setValue(this.creditor.contraliaProv);
};

CreditorInfoModule.prototype.saveCreditorInfo = function(creditor){
	if (this.validate()) {
		var cred = new Object();
		if (Util.checkObject(this.creditor)) {
			cred.id = this.creditor.id;
			cred.creditorId = this.creditor.creditorId;
		}
		cred.socialName = this.infosCollapsible.inputSocialName.getValue();
		cred.commercialName = this.infosCollapsible.inputCommercialName.getValue();
		cred.legalForm = this.infosCollapsible.inputLegalForm.getValue();
		cred.siren = this.infosCollapsible.inputSiren.getValue();
		cred.activity = this.infosCollapsible.inputActivity.getValue();
		if (this.infosCollapsible.inputNne.getValue() != ""){
			// not null constraint forces to go with no-key to the server, this will lead to null in DB
			cred.nne = this.infosCollapsible.inputNne.getValue();
		}
		cred.ics = this.infosCollapsible.inputIcs.getValue();
		if (Util.check(this.infosCollapsible.inputParent.getValue())){
			cred.parentId = this.infosCollapsible.inputParent.getValue().id;
		}
		cred.email = this.infosCollapsible.inputEmail.getValue();
		cred.phone = this.infosCollapsible.inputPhone.getValue();
		cred.address1 = this.infosCollapsible.inputAddress1.getValue();
		cred.address2 = this.infosCollapsible.inputAddress2.getValue();
		cred.zipCode = this.infosCollapsible.inputZip.getValue();
		cred.city = this.infosCollapsible.inputCity.getValue();
		cred.country = this.infosCollapsible.inputCountry.getValue();
		
		cred.rumCreation = this.rumParametersCollapsible.inputRumCreation.getValue();
		cred.rumPrefix = this.rumParametersCollapsible.inputRumPrefix.getValue();
		
		cred.remitMode = this.remitParamsCollapsible.inputRemitMode.getValue();
		cred.remitFreq = this.remitParamsCollapsible.inputRemitFrequency.getValue();
		cred.remitDay = this.remitParamsCollapsible.inputDay.getValue();
		cred.cutOffHour = this.remitParamsCollapsible.inputCutoffBankTime.getValue();
		cred.remitoffsetFirst = this.remitParamsCollapsible.inputCutoffFirst.getValue();
		cred.remitoffsetRecurrent = this.remitParamsCollapsible.inputCutoffRecur.getValue();
		cred.remitInfo = this.remitParamsCollapsible.inputRemitInformations.getValue();
		
		cred.contraliaUser = this.contraliaParamsCollapsible.inputContraliaUser.getValue();
		cred.contraliaPwd = this.contraliaParamsCollapsible.inputContraliaPwd.getValue();
		cred.contraliaDist = this.contraliaParamsCollapsible.inputContraliaDistrib.getValue();
		cred.contraliaOffer = this.contraliaParamsCollapsible.inputContraliaOffer.getValue();
		cred.contraliaProv = this.contraliaParamsCollapsible.inputContraliaProvider.getValue();
		
		AjaxManager.postJSON('saveCreditor', {
			'creditor' : JSON.stringify(cred)
		}, function(result) {
			if (result.success){
				UserManager.setReferrer(result.creditor);
				PopupModule.getInstance().show({
					'title' : I18n.get('creditor.info.save.successT'),
					'content' : I18n.get('creditor.info.save.success'),
					'button0' : { 'text' : 'OK' }
				});
				NavigationManager.reload();
			} else {
				//popup is handled by AjaxManager
			}
		});
	} else {
		console.error('Cannot validate creditor');
		PopupModule.getInstance().show({
			'title' : I18n.get('creditor.validate.error.title'),
			'content' : I18n.get('creditor.validate.error.content'),
			'button0' : { 'text' : 'OK' }
		});
	}
};

/**
 * Change the remit day depending on the selected remit frequency
 * 
 * @param value if a value should be set after changing content of inputDay,
 */
CreditorInfoModule.prototype.remitFrequencyChanged = function(value) {
	this.remitParamsCollapsible.inputDay.setReadonly(false);
	if (this.remitParamsCollapsible.inputRemitFrequency.getValue() == 'WEEKLY') {
		this.remitParamsCollapsible.inputDay.setOptions(EnumManager.ScheduleDay, true);
	} else if(this.remitParamsCollapsible.inputRemitFrequency.getValue() == 'MONTHLY') {
		var range = {};
		for (var i = CreditorInfoModule.DAY_RANGE[0]; i < CreditorInfoModule.DAY_RANGE[1]; i++) {
			range['' + i] = '' + i;
		}
		this.remitParamsCollapsible.inputDay.setOptions(range, true);
	} else {
		this.remitParamsCollapsible.inputDay.setOptions({}, true);
		this.remitParamsCollapsible.inputDay.setReadonly(true);
	}
	this.remitParamsCollapsible.inputDay.setLabel(
			I18n.get('creditor.params.day.label',
			false,
			[I18n.get(this.remitParamsCollapsible.inputRemitFrequency.options[this.remitParamsCollapsible.inputRemitFrequency.getValue()])]));
	if (Util.check(value)) {
		this.remitParamsCollapsible.inputDay.setValue(value);
	}
	this.remitParamsCollapsible.inputDay.buildJQ();
};

/**
 * Loads the creditor directly from the parameters
 */
CreditorInfoModule.prototype.loadData = function(callback) {
	this.setCreditor(this.parameters.referrer);
	Util.getFunction(callback)();
};
