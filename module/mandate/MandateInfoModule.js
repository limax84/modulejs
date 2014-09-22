/**
 * Class MandateInfoModule.
 * 
 * @author Flavio Duboc
 */
MandateInfoModule.inherits(Module);
function MandateInfoModule() {
	var that = this;

	this.mandate = undefined;
	
	/** Creditor Modules */
	this.inputCreditor = new InputReferrerModule({
		'label' : I18n.get('mandate.creditor.label'),
		'selectableType' : InputReferrerModule.TYPE_CREDITOR,
		'mandatory' : true,
		'onSelect' : function(creditor) {
			that.setCreditor(creditor, function() {
				that.buildJQ();
			});
		}
	});
	this.inputFlow = new InputSelectModule({
		'label' : I18n.get('flow'),
		'options' : {},
		'defaultValue' : '',
		'mandatory' : true,
		'getText' : function(key, object) {
			if (Util.checkObject(object)) {
				return object.name;
			}
			return object;
		},
		'onChange' : function() {
			that.setMandateFlowId(this.value);
		}
	});
	
	/** Debtor Modules */
	this.inputDebtorName = new InputTextModule({
		'label' : I18n.get('mandate.debtor.name.label'),
		'placeholder' : I18n.get('mandate.debtor.name.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true
	});
	this.inputDebtorFirstName = new InputTextModule({
		'label' : I18n.get('mandate.debtor.firstname.label'),
		'placeholder' : I18n.get('mandate.debtor.firstname.label'),
		'validationPattern' : ValidationPattern.VALID_EXTENDED,
		'mandatory' : true
	});
	this.inputDebtorPhone = new InputTextModule({
		'label' : I18n.get('mandate.debtor.phone.label'),
		'placeholder' : I18n.get('mandate.debtor.phone.label'),
		'validationPattern' : ValidationPattern.VALID_PHONE_NUMBER
	});
	this.inputDebtorEmail = new InputTextModule({
		'label' : I18n.get('mandate.debtor.email.label'),
		'placeholder' : I18n.get('mandate.debtor.email.label'),
		'validationPattern' : ValidationPattern.VALID_EMAIL
	});
	this.inputDebtorStreetAndNumber = new InputTextModule({
		'label' : I18n.get('mandate.debtor.streetnumber.label'),
		'placeholder' : I18n.get('mandate.debtor.streetnumber.label'),
		'validationPattern' : ValidationPattern.VALID_EXTENDED
	});
	this.inputDebtorAddressComplement = new InputTextModule({
		'label' : I18n.get('mandate.debtor.addresscomplement.label'),
		'placeholder' : I18n.get('mandate.debtor.addresscomplement.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputDebtorAddressComplement2 = new InputTextModule({
		'label' : '',
		'placeholder' : '',
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputDebtorZipCode = new InputTextModule({
		'label' : I18n.get('mandate.debtor.zipcode.label'),
		'placeholder' : I18n.get('mandate.debtor.zipcode.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputDebtorCity = new InputTextModule({
		'label' : I18n.get('mandate.debtor.city.label'),
		'placeholder' : I18n.get('mandate.debtor.city.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputDebtorCountry = new InputSelectModule({
		'label' : I18n.get('mandate.debtor.country.label'),
		'options' : Object.sortByValue(Countries.getAll()),
        'value' : 'FR'
	});
	
	/** Bank account modules */
	this.inputDebtorBIC = new InputTextModule({
		'label' : I18n.get('mandate.bic'),
		'placeholder' : I18n.get('mandate.bic'),
		'validationPattern' : ValidationPattern.VALID_BIC
	});
	this.inputDebtorIBAN = new InputTextModule({
		'label' : I18n.get('mandate.iban'),
		'placeholder' : I18n.get('mandate.iban'),
		'validationPattern' : ValidationPattern.VALID_IBAN,
		'validationMethod' : new ValidationMethod({
			'errorMessage' : I18n.get('invalid.iban'),
			'method' : function(value) {
				value = String.removeWhiteSpace(value);
				if (Util.checkStringEmpty(value)) {
					return true;
				}
				var invertedIban = value.substring(4) + value.substring(0, 4);
				var extendedIban = '';
				for (var i = 0; i < invertedIban.length; i++) {
					extendedIban = extendedIban + parseInt(invertedIban.charAt(i), 36);
				}
				var bigIban = BigInteger(extendedIban);
				return bigIban.remainder(97) == 1;
			}
		})
	});

	/** Mandate Modules */
	this.inputMandatDateSignature = new InputDateModule({
		'label' : I18n.get('mandate.date.signature.label'),
		'placeholder' : I18n.get('mandate.date.signature.label'),
		'maxDate' : moment().add('days', 1)
	});
	this.inputMandatePlaceSignature = new InputTextModule({
		'label' : I18n.get('mandate.place.signature.label'),
		'placeholder' : I18n.get('mandate.place.signature.label'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT
	});
	this.inputMandateLanguage = new InputSelectModule({
		'label' : I18n.get('mandate.language'),
		'options' : []
	});
	this.inputMandateRum = new InputTextModule({
		'label' : I18n.get('mandate.rum.label') + '**',
		'placeholder' : I18n.get('mandate.rum.placeholder'),
		'validationPattern' : ValidationPattern.VALID_RUM
	});
	
	this.inputCustomProperties = new Array();
	
	this.inputCreditor.selectUniqueCreditor();
}

MandateInfoModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_MANDATE"];
};

MandateInfoModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Creditor
	jQ.append($('<h5>' + I18n.get('creditor') + '</h5>'));
	var jQCreditor = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(jQCreditor);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputCreditor.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputFlow.buildJQ());
	jQCreditor.append(columnLeft).append(columnRight);

	// Debtor
	jQ.append($('<h5>' + I18n.get('debtor') + '</h5>'));
	var jQDebtor = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(jQDebtor);
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputDebtorName.buildJQ());
	columnLeft.append(this.inputDebtorFirstName.buildJQ());
	columnLeft.append(this.inputDebtorPhone.buildJQ());
	columnLeft.append(this.inputDebtorEmail.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputDebtorStreetAndNumber.buildJQ());
	columnRight.append(this.inputDebtorAddressComplement.buildJQ());
	columnRight.append(this.inputDebtorAddressComplement2.buildJQ());
	columnRight.append(this.inputDebtorZipCode.buildJQ());
	columnRight.append(this.inputDebtorCity.buildJQ());
	columnRight.append(this.inputDebtorCountry.buildJQ());
	jQDebtor.append(columnLeft).append(columnRight);
	
	// Bank account
	jQ.append($('<h5 class="bicIbanTitle">' + I18n.get('mandate.debtor.bank.data') + '**</h5>'));
	if (UserManager.hasRoles(['VIEW_BIC_IBAN'])) {
		jQ.find('.bicIbanTitle').append($('<i class="icon-eye-open icon"/>').click(function() {
			that.refreshBicIban();
		}));
	}
	if (!UserManager.hasRoles(['WRITE_BIC_IBAN'])) {
		this.inputDebtorBIC.setReadonly(true);
		this.inputDebtorIBAN.setReadonly(true);
	}
	var jQDebtorAccount = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(jQDebtorAccount);
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputDebtorBIC.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputDebtorIBAN.buildJQ());
	jQDebtorAccount.append(columnLeft).append(columnRight);
	
	// Mandate
	jQ.append($('<h5>' + I18n.get('mandate') + '</h5>'));
	var jQMandat = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(jQMandat);
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputMandatDateSignature.buildJQ());
	columnLeft.append(this.inputMandatePlaceSignature.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputMandateLanguage.buildJQ());
	if (!Util.check(this.mandate.id) && Util.checkObject(this.inputCreditor.value) && this.inputCreditor.value.rumProvided) {
		this.inputMandateRum.setMandatory(true);
	}
	if (Util.check(this.mandate.id) || (Util.checkObject(this.inputCreditor.value) && this.inputCreditor.value.rumProvided)) {
		columnRight.append(this.inputMandateRum.buildJQ());
	}
	
	jQMandat.append(columnLeft).append(columnRight);
	
	// Optional data
	if (that.inputCustomProperties.length > 0) {
		
		jQ.append($('<h5>' + I18n.get('mandate.custom.creditor.parameters') + '</h5>'));
		var jQCustomParameters = $('<div class="form well cropbottom"></div>');
		jQ.append(jQCustomParameters);
		
		$.each(that.inputCustomProperties, function(index, inputCustomProperty) {
			var jQCustomParameter = $('<div class="row-fluid"></div>');
			jQCustomParameters.append(jQCustomParameter);
			if (Util.getClassName(inputCustomProperty) == 'InputMultipleValueTextModule') {
				jQCustomParameter.append($('<div class="span12"></div>').append(inputCustomProperty.buildJQ()));
			} else {
				jQCustomParameter.append($('<div class="span6"></div>').append(inputCustomProperty.buildJQ())).append($('<div class="span6"></div>'));
			}
		});
	}
	
	// Footer
	var jQMandatFooterMandatory = $('<p style="text-align: left;">' + I18n.get('mandate.footer.mandatory.fields') + '</p>');
	var jQMandatFooterAmendment = $('<p style="text-align: left;">' + I18n.get('mandate.footer.amendment.fields') + '</p>');
	
	var jQMandatSaveButton = $('<div class="btn-row"><button class="mandate-save-btn">' + I18n.get('save') + '</button></div>');	
	jQMandatSaveButton.click(function() { that.submitMandate(); });
	
	jQ.append(jQMandatFooterMandatory).append(jQMandatFooterAmendment).append(jQMandatSaveButton);
	
	// Sets focus on first input field
	this.inputDebtorName.getJQ().find('input').focus();
	
	// Executes validation to show mandatory and advised fields
	this.validate();
};

/**
 * Loads the mandate if rum and creditorId are found in parameters
 */
MandateInfoModule.prototype.loadData = function(callback) {
	if (!this.isMandateAware()) {
		this.setMandate(null);
		Util.getFunction(callback)();
		return;
	}
	var that = this;
	AjaxManager.getJSON('getMandate', {
		'rum' : this.parameters.mandateRum,
		'creditorId' : this.parameters.creditorId
	}, function(result) {
		if (result.success) {
			that.setMandate(result.mandate, callback);
		} else {
			PopupModule.getInstance().show({
				'title' : I18n.get('warning'),
				'content' : I18n.get('mandate.not.found'),
				'button0' : { 'text' : 'OK' }
			});
			console.warn('Mandate not found [rum=' + that.parameters.mandateRum + '; creditorId=' + that.parameters.creditorId);
			Util.getFunction(callback)();
		}
	});
};

MandateInfoModule.prototype.setMandate = function(mandate, callback) {
	this.mandate = Util.getObject(mandate);
	
	var that = this;
	this.setCreditor(this.mandate.creditor, function() {
		that.inputCreditor.setReadonly(Util.check(that.mandate.id));
		that.inputFlow.setReadonly(Util.check(that.mandate.id) && that.mandate.status != 'Created');
		that.mandate.debtor = Util.getObject(that.mandate.debtor);
		that.inputDebtorName.setValue(that.mandate.debtor.name);
		that.inputDebtorFirstName.setValue(that.mandate.debtor.firstName);
		that.inputDebtorPhone.setValue(that.mandate.debtor.phoneNumber);
		that.inputDebtorEmail.setValue(that.mandate.debtor.emailAddress);
		that.mandate.debtor.address = Util.getObject(that.mandate.debtor.address);
		that.inputDebtorStreetAndNumber.setValue(that.mandate.debtor.address.streetInfo);
		that.inputDebtorAddressComplement.setValue(that.mandate.debtor.address.line1);
		that.inputDebtorAddressComplement2.setValue(that.mandate.debtor.address.line2);
		that.inputDebtorZipCode.setValue(that.mandate.debtor.address.postalCode);
		that.inputDebtorCity.setValue(that.mandate.debtor.address.townName);
		that.inputDebtorCountry.setValue(that.mandate.debtor.address.countryCode);
		that.inputMandatDateSignature.setValue(Util.check(that.mandate.signDate) ? moment(that.mandate.signDate).format('L') : moment().add('days', 1));
		that.inputMandatePlaceSignature.setValue(that.mandate.signPlace);
		that.inputMandateLanguage.setValue(that.mandate.language);
		that.inputMandateRum.setReadonly(Util.check(that.mandate.id));
		that.inputMandateRum.setValue(that.mandate.rum);
		that.inputDebtorBIC.setPlaceholder(Util.check(that.mandate.id) ? '*************' : I18n.get('mandate.bic'));
		that.inputDebtorBIC.setValue('');
		that.inputDebtorIBAN.setPlaceholder(Util.check(that.mandate.id) ? '*************' : I18n.get('mandate.bic'));
		that.inputDebtorIBAN.setValue('');
		Util.getFunction(callback)();
	});
};

MandateInfoModule.prototype.setCreditor = function(creditor, callback) {
	var that = this;
	this.inputCreditor.setValue(creditor);
	creditor = Util.getObject(creditor);
	
	// Languages
	this.inputMandateLanguage.setOptions(creditor.languages);
	if (Util.check(this.mandate.language)) {
		this.inputMandateLanguage.setValue(this.mandate.language).buildJQ();
	} else if (Util.checkArray(creditor.languages) && creditor.languages.contains('fr')) {
		this.inputMandateLanguage.setValue('fr').buildJQ();
	}

	// Optional data
	that.inputCustomProperties = new Array();
	if (Util.check(creditor.id)) {
		AjaxManager.getJSON('getInheritedCustomProperties', {
			'referrerId' : creditor.id
		}, function(result) {
			var customProperties = $.extend({}, creditor.customProperties, result.inheritedCustomProperties);
			$.each(customProperties, function(key, customProperty) {
				var inputCustomProperty = undefined;
				if (customProperty.type == 'ALPHA_NUMERIC') {
					inputCustomProperty = new InputTextModule({
						'label' : customProperty.name,
						'placeholder' : customProperty.name,
						'validationPattern' : ValidationPattern.VALID_DEFAULT
					});
				} else if (customProperty.type == 'CHOICE_LIST') {
					inputCustomProperty = new InputSelectModule({
						'label' : customProperty.name,
						'defaultValue' : '',
						'options' : customProperty.values
					});
				} else if (customProperty.type == 'VALUE_LIST') {
					inputCustomProperty = new InputMultipleValueTextModule({
						'label' : customProperty.name,
						'placeholder' : customProperty.name,
						'validationPattern' : ValidationPattern.VALID_DEFAULT
					});
				} else {
					throw 'Custom property type [' + customProperty.type + '] is invalid';
				}
				that.inputCustomProperties.push(inputCustomProperty);
				inputCustomProperty.key = customProperty.key;
				inputCustomProperty.name = customProperty.name; // TODO verifier à quoi cela correspond, si c'est necessaire et si c'est utilisé
				if (Util.checkObject(that.mandate) && Util.checkObject(that.mandate.customProperties)) {
					$.each(that.mandate.customProperties, function(j, mandateProperty) {
						if (mandateProperty.key == customProperty.key) {
							inputCustomProperty.setValue(mandateProperty.value);
						}
					});
				}
			});
			
			// Flows
			if (Util.check(creditor.id)) {
				AjaxManager.getJSON('getAvailableMandateFlowsForUser', {
					'referrerId' : creditor.id
				}, function(result) {
					if (result.success) {
						that.inputFlow.setOptions(result.availableMandateFlowsForUser, true);
						that.setMandateFlowId(Util.checkObject(that.mandate.mandateFlow) ? that.mandate.mandateFlow.id : undefined);
						Util.getFunction(callback)();
					}
				});
			}
		});
	}
	else {
		that.inputFlow.setOptions({}, true);
		Util.getFunction(callback)();
	}
};

MandateInfoModule.prototype.setMandateFlowId = function(mandateFlowId) {
	var that = this;
	var mandateFlow = undefined;
	$.each(this.inputFlow.options, function(id, flow) {
		if (mandateFlowId == id) {
			mandateFlow = flow;
		}
	});
	if (Util.checkObject(mandateFlow)) {
		// Sets the value of the flow select
		this.inputFlow.setValue(mandateFlowId);
		
		// If the created status is allowed, flow's field are just advised, mandatory otherwise
		var validityFieldMethod = 'setMandatory';
		if (mandateFlow.createdStatus) {
			validityFieldMethod = 'setAdvised';
		}

		// Standard SEPA mandate properties Mandatory
		this.inputDebtorPhone.setMandatory(false).buildJQ();
		this.inputDebtorPhone.setAdvised(false).buildJQ();
		this.inputDebtorEmail.setMandatory(false).buildJQ();
		this.inputDebtorEmail.setAdvised(false).buildJQ();
		if (Util.checkArray(mandateFlow.mandatoryProperties)) {
			$.each(mandateFlow.mandatoryProperties, function (index, property) {
				if (property == 'DEBTOR_PHONE') {
					that.inputDebtorPhone[validityFieldMethod](true).buildJQ();
				}
				if (property == 'DEBTOR_EMAIL') {
					that.inputDebtorEmail[validityFieldMethod](true).buildJQ();
				}
			});
		}
		this.inputDebtorPhone.validate();
		this.inputDebtorEmail.validate();

		// Custom mandate properties Mandatory
		$.each(this.inputCustomProperties, function(index, inputCustomProperty) {
			inputCustomProperty.setMandatory(false).buildJQ();
			inputCustomProperty.setAdvised(false).buildJQ();
			if (Util.checkArray(mandateFlow.mandatoryCustomProperties)) {
				$.each(mandateFlow.mandatoryCustomProperties, function (index, propertyKey) {
					if (inputCustomProperty.key == propertyKey) {
						inputCustomProperty[validityFieldMethod](true).buildJQ();
						return false;
					}
				});
			}
			inputCustomProperty.validate();
		});
	}
};

MandateInfoModule.prototype.refreshBicIban = function() {
	if (!Util.check(this.mandate.id)) {
		return;
	}
	var that = this;
	AjaxManager.getJSON('getBicIban', {
		'mandateId' : this.mandate.id
	}, function(result) {
		if (result.success) {
			var bicIban = result.bicIban.split('||');
			that.inputDebtorBIC.setValue(bicIban[0]).buildJQ();
			that.inputDebtorIBAN.setValue(bicIban[1]).buildJQ();
			if (Util.checkStringEmpty(bicIban[0])){
				that.inputDebtorBIC.setPlaceholder(I18n.get('mandate.bic')).buildJQ();
			}
			if (Util.checkStringEmpty(bicIban[1])){
				that.inputDebtorIBAN.setPlaceholder(I18n.get('mandate.iban')).buildJQ();
			}
		}
	});
};

MandateInfoModule.prototype.isMandateAware = function() {
	return Util.checkString(this.parameters.mandateRum) && Util.checkString(this.parameters.creditorId);
};

MandateInfoModule.prototype.validate = function() {
	var valid = this.parentMethod(Module, 'validate');
	$.each(this.inputCustomProperties, function(index, inputCustomProperty) {
		valid = inputCustomProperty.validate() && valid;
	});
	return valid;
};

MandateInfoModule.prototype.submitMandate = function() {
	if (!this.validate()) {
		PopupModule.getInstance().show({
			'title' : I18n.get('invalid.form'),
			'content' : I18n.get('invalid.form.desc'),
			'button0' : { 'text' : 'OK' }
		});
		return;
	}
	
	var parameters = {
		'creditorId' : this.inputCreditor.value.creditorId,
		'debtor.lastName' : this.inputDebtorName.value,
		'debtor.firstName' : this.inputDebtorFirstName.value,
		'debtor.phoneNumber' : this.inputDebtorPhone.value,
		'debtor.email' : this.inputDebtorEmail.value,
		'debtor.street' : this.inputDebtorStreetAndNumber.value,
		'debtor.complement' : this.inputDebtorAddressComplement.value,
		'debtor.complement2' : this.inputDebtorAddressComplement2.value,
		'debtor.postalCode' : this.inputDebtorZipCode.value,
		'debtor.town' : this.inputDebtorCity.value,
		'debtor.countryCode' : this.inputDebtorCountry.value,
		'signDate' : this.inputMandatDateSignature.value,
		'signPlace' : this.inputMandatePlaceSignature.value,
		'language' : this.inputMandateLanguage.value,
		'rum' : this.inputMandateRum.value,
		'debtor.bic' : String.removeWhiteSpace(this.inputDebtorBIC.value),
		'debtor.iban' : String.removeWhiteSpace(this.inputDebtorIBAN.value),
		'bicibanmodified' : (this.inputDebtorBIC.modified || this.inputDebtorIBAN.modified) && UserManager.hasRoles(['WRITE_BIC_IBAN']),
		'mandateFlowId' : this.inputFlow.value
	};
	$.each(this.inputCustomProperties, function(index, inputCustomProperty) {
		parameters['properties[' + index + '].key'] = inputCustomProperty.key;
		parameters['properties[' + index + '].value'] = inputCustomProperty.getValue();
	});
	
	var that = this;
	if (!Util.check(this.mandate.id)) {
		AjaxManager.postJSON('saveMandate', parameters, function(result) {
			that.handleSubmitResult(result);
		});
	} else {
		AjaxManager.postJSON('updateMandate', parameters, function(result) {
			that.handleSubmitResult(result);
		});
	}
};

MandateInfoModule.prototype.handleSubmitResult = function(result) {
	var that = this;
	if (result.success) {
		PopupModule.getInstance().show({
			'title' : I18n.get('mandate.saved'),
			'content' : I18n.get('mandate.saved.desc', false, [result.rum]),
			'button0' : {
				'text' : 'OK',
				'callback' : function() {
					NavigationManager.reload('MandatePage?mandateRum=' + result.rum + '&creditorId=' + that.inputCreditor.value.creditorId);
				}
			}
		});
	} else {
		var hasMsgDesc = false;
		if (Util.checkStringNotEmpty(result.userMessageCode)) {
			hasMsgDesc = true;
			if (Util.checkStringNotEmpty(result.errorInputField)) {
				if (result.errorInputField == 'rum') {
					this.inputMandateRum.setInvalid(I18n.get(result.userMessageCode));
				} else if (result.errorInputField == 'bic') {
					this.inputDebtorBIC.setInvalid(I18n.get(result.userMessageCode));
				}
			}
		}
		
		if (Util.checkStringNotEmpty(that.inputMandateRum.value)) {
			PopupModule.getInstance().show({
				'title' : I18n.get('mandate.save.error'),
				'content' : hasMsgDesc? I18n.get(result.userMessageCode) : I18n.get('mandate.save.error.desc', false, [that.inputMandateRum.value]),
				'button0' : { 'text' : 'OK' }
			});
		} else {
			PopupModule.getInstance().show({
				'title' : I18n.get('mandate.save.error'),
				'content' : hasMsgDesc? I18n.get(result.userMessageCode) : "",
				'button0' : { 'text' : 'OK' }
			});
		}
	}
};
