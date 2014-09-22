/**
 * Class MandatesPage.
 * 
 * @author Maxime Ollagnier
 */
MandatesPage.inherits(Module);
function MandatesPage() {
	
	var that = this;
	
	this.inputCustomProperties = new Array();
	this.showCustomForm = false;
	
	/** Inputs modules */
	this.inputDebtor = new InputTextModule({
		'label' : I18n.get('debtor'),
		'placeholder' : I18n.get('debtor.name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT_SEARCH,
		'onEnter' : function() { that.mandateTable.pagerStart = 0; that.searchMandates(); }
	});
	this.inputBic = new InputTextModule({
		'label' : I18n.get('mandate.bic'),
		'placeholder' : I18n.get('mandate.bic'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT_SEARCH,
		'onEnter' : function() { that.mandateTable.pagerStart = 0; that.searchMandates(); }
	});
	this.inputIban = new InputTextModule({
		'label' : I18n.get('mandate.iban'),
		'placeholder' : I18n.get('mandate.iban'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT_SEARCH,
		'onEnter' : function() { that.mandateTable.pagerStart = 0; that.searchMandates(); }
	});
	this.inputRum = new InputTextModule({
		'label' : I18n.get('mandate.rum'),
		'placeholder' : I18n.get('mandate.rum'),
		'validationPattern' : ValidationPattern.VALID_RUM,
		'onEnter' : function() { that.mandateTable.pagerStart = 0; that.searchMandates(); }
	});
	this.inputStatus = new InputSelectModule({
		'label' : I18n.get('status'),
		'options' : EnumManager.MandateStatus
	});
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'value' : UserManager.user.referrer,
		'rootReferrer' : UserManager.user.referrer,
		'mandatory' : true,
		'onSelect' : function(referrer) {
			that.setReferrer(referrer);
			that.buildJQ();
		}
	});
	this.inputMandateFlow = new InputSelectModule({
		'label' : I18n.get('flow'),
		'defaultValue' : '',
		'getText' : function(id, mandateFlow) {
			if (Util.checkObject(mandateFlow)) {
				return mandateFlow.name;
			}
			return '';
		}
	});
	
	/** Result table module */
	this.mandateTable = new TableModule();
	this.mandateTable.columnList.push(new Column('debtor', I18n.get('debtor'), '17%', true));
	this.mandateTable.columnList.push(new Column('rum', I18n.get('mandate.rum'), '35%', true));
	this.mandateTable.columnList.push(new Column('creditor', I18n.get('creditor'), '17%', true));
	this.mandateTable.columnList.push(new Column('mandateFlowName', I18n.get('flow'), '16%', true));
	var statusCol = new Column('status', I18n.get('status'), '15%', true, true);
	this.mandateTable.columnList.push(statusCol);
	statusCol.getText = function(mandate) {
		return $('<span class="MandateStatus_' + mandate.status + '">' + I18n.get('MandateStatus.' + mandate.status) + '</span>');
	};
	this.mandateTable.onClickTr = function(jQTr) {
		var mandateId = jQTr.attr('id').split('&');
		var rum = mandateId[0];
		var creditorId = mandateId[1];
		NavigationManager.goTo('MandatePage?mandateRum=' + rum + '&creditorId=' + creditorId);
	};
	this.mandateTable.pagerShow = true;
	this.mandateTable.pagerMax = 10;
	this.mandateTable.onClickPager = function() {
		that.searchMandates();
	};
	this.setReferrer(this.inputReferrer.value);
	this.inputReferrer.selectUniqueCreditor();
}

MandatesPage.neededRoles = ["ROLE_USER", "VIEW_MANDATE"];

MandatesPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('mandate.search.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well row-fluid"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputDebtor.buildJQ());
	columnLeft.append(this.inputBic.buildJQ());
	columnLeft.append(this.inputIban.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputRum.buildJQ());
	columnRight.append(this.inputStatus.buildJQ());
	columnRight.append(this.inputReferrer.buildJQ());
	columnRight.append(this.inputMandateFlow.buildJQ());
	form.append(columnLeft).append(columnRight);
	
	// Custom properties
	if (this.inputCustomProperties.length > 0) {
		form.append($('<h5><span>' + I18n.get('mandate.search.advanced') + '</span><i class="icon"/></h5>'));
		form.find('h5').click(function() {
			that.showCustomForm = !that.showCustomForm;
			that.buildJQ();
		});
		
		var customForm = $('<div class="customForm form cropbottom row-fluid"></div>');
		form.append(customForm);
		if (!this.showCustomForm) {
			customForm.hide();
			form.find('h5 i').addClass('icon-plus');
		} else {
			customForm.show();
			form.find('h5 i').addClass('icon-minus');
		}
		
		var columnLeft = $('<div class="span6"></div>');
		var columnRight = $('<div class="span6"></div>');
		customForm.append(columnLeft).append(columnRight);
		
		$.each(this.inputCustomProperties, function(index, inputCustomProperty) {
			if (index % 2 == 0) {
				columnLeft.append(inputCustomProperty.buildJQ());
			} else {
				columnRight.append(inputCustomProperty.buildJQ());
			}
		});
	}
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.mandateTable.pagerStart = 0; that.searchMandates(); });
	buttonRow.append(buttonSearch);
	
	var buttonNew = $('<div class="btn new">' + I18n.get('mandate.new') + '</div>');
	buttonNew.click(function() { that.createNewMandate(); });
	buttonRow.append(buttonNew);
	
	// Sets focus on first input field
	this.inputDebtor.getJQ().find('input').focus();
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('mandate.search.list') + '</h4>'));
	jQ.append(result);
	if (this.mandateTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.mandateTable.buildJQ());
};

/**
 * TODO Comment
 */
MandatesPage.prototype.searchMandates = function() {
	if (!this.validate()) {
		return;
	}
	
	var params = {
		'debtorName' : this.inputDebtor.value,
		'rum' : this.inputRum.value,
		'bic' : this.inputBic.value,
		'iban' : this.inputIban.value,
		'status' : this.inputStatus.value,
		'sortBy' : this.mandateTable.sortBy,
		'sortDesc' : this.mandateTable.sortDesc,
		'start' : this.mandateTable.pagerStart,
		'size' : this.mandateTable.pagerMax
	};
	var creditors = this.inputReferrer.getCreditors();
	$.each(creditors, function(index, creditor) {
		params['creditorId' + index] = creditor.id;
	});
	var i = 0;
	$.each(this.inputCustomProperties, function(index, inputCustomProperty) {
		if (Util.checkStringNotEmpty(inputCustomProperty.value)) {
			params['customProperty' + (i++)] = inputCustomProperty.key + '##' + inputCustomProperty.value;
		}
	});
	if (Util.checkString(this.inputMandateFlow.value)) {
		params['mandateFlowId'] = this.inputMandateFlow.value;
	}
	
	var that = this;
	AjaxManager.getJSON('getMandates', params, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.mandateTable.pagerTotal = result.totalCount;
			that.mandateTable.objectMap = new Map();
			for (var i = 0; i < result.mandates.length; i++) {
				that.mandateTable.objectMap.put(result.mandates[i].rum + '&' + result.mandates[i].creditorId, result.mandates[i]);
			}
			that.mandateTable.buildJQ();
		}
	});
};

/**
 * TODO Comment
 */
MandatesPage.prototype.createNewMandate = function() {
	NavigationManager.goTo('MandatePage');
};

/**
 * TODO Comment
 */
MandatesPage.prototype.setReferrer = function(referrer) {
	this.showCustomForm = false;
	// Optional data
	this.inputCustomProperties = new Array();
	var that = this;
	$.each(referrer.customProperties, function(i, customProperty) {
		if (customProperty.indexed) {
			var inputCustomProperty = undefined;
			if (customProperty.type == 'CHOICE_LIST') {
				inputCustomProperty = new InputSelectModule({
					'label' : customProperty.name,
					'options' : customProperty.values,
					'defaultValue' : ''
				});
			} else {
				inputCustomProperty = new InputTextModule({
					'label' : customProperty.name,
					'placeholder' : customProperty.name,
					'validationPattern' : ValidationPattern.VALID_DEFAULT,
					'onEnter' : function() { that.mandateTable.pagerStart = 0; that.searchMandates(); }
				});
			}
			inputCustomProperty.key = customProperty.key;
			that.inputCustomProperties.push(inputCustomProperty);
		}
	});
	// Mandate flows
	AjaxManager.getJSON("getAvailableMandateFlowsForUser", {
		'referrerId' : referrer.id
	}, function(result) {
		if (result.success) {
			that.inputMandateFlow.setOptions(result.availableMandateFlowsForUser, true).buildJQ();
		}
	});
};