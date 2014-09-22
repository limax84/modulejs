/**
 * Class CreditorAccountModule.
 * 
 * @author Jean-Luc Scheefer
 */
CreditorAccountModule.inherits(Module);
function CreditorAccountModule() {
	this.creditor = undefined;
	var that = this;
	
	/** Input Modules for infos */
	this.inputBic = new InputTextModule({
		'label' : I18n.get('creditor.accounts.add.bic'),
		'placeholder' : I18n.get('creditor.accounts.add.bic'),
		'validationPattern' : ValidationPattern.VALID_BIC,
		'widthClass' : "input-large",
		'mandatory' : true
	});
	this.inputIban = new InputTextModule({
		'label' : I18n.get('creditor.accounts.add.iban'),
		'placeholder' : I18n.get('creditor.accounts.add.iban'),
		'validationPattern' : ValidationPattern.VALID_IBAN,
		'mandatory' : true
	});
	
	// Accounts table declaration
	this.accountsTable = new TableModule();
	this.accountsTable.objectMap = new Map();
	this.accountsTable.id = 'accountsTable';
	// column definition. Defines special text generation for the column
	this.accountsTable.columnList.push(new Column('bic', I18n.get('creditor.table.bic'), '30%', true));
	this.accountsTable.columnList.push(new Column('iban', I18n.get('creditor.table.iban'), '55%', true));
	
	var defaultColumn = new Column('default', I18n.get('creditor.table.default'), '15%', true);
	defaultColumn.getAlt = undefined;
	defaultColumn.getText = function(account) {
		var jQCheckbox = $('<input type="checkbox" ' + (account.byDefault ? 'checked="checked"' : '') + ' ' + (UserManager.hasRoles(['WRITE_BIC_IBAN']) ? '' : 'disabled="disabled"') + '></input>');
		jQCheckbox.change(function(){
			that.selectDefault(account);
		});
		return jQCheckbox;
	};
	this.accountsTable.columnList.push(defaultColumn);
}

CreditorAccountModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_CREDITOR", "VIEW_BIC_IBAN"];
};

CreditorAccountModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	jQ.append($('<h5>' + I18n.get('creditor.accounts') + '</h5>'));
	
	jQ.append(this.accountsTable.buildJQ());
	
	if (UserManager.hasRoles(['WRITE_BIC_IBAN'])) {
		jQ.append("<hr/>");
		jQ.append($('<h5>' + I18n.get('creditor.accounts.add') + '</h5>'));
		var formAdd = $('<div class="form well cropbottom row-fluid"></div>');
		var column1 = $('<div class="span4"></div>');
		column1.append(this.inputBic.buildJQ());
		var column2 = $('<div class="span5"></div>');
		column2.append(this.inputIban.buildJQ());
		var column3 = $('<div class="span3"></div>');
		var buttonAdd = $('<button class="btn">Ajouter</button>');
		buttonAdd.click(function(){that.addNewAccount();});
		column3.append(buttonAdd);
		formAdd.append(column1).append(column2).append(column3);
		jQ.append(formAdd);
		
		// Footer
		/*var jQCreditorFooterMandatory = $('<p style="text-align: left;">' + I18n.get('mandate.footer.mandatory.fields') + '</p>');
		jQ.append(jQCreditorFooterMandatory);*/
		var jQCreditorSaveButton = $('<div class="btn-row"><button class="creditor-save-btn">' + I18n.get('save') + '</button></div>');	
		jQCreditorSaveButton.click(function() { that.saveCreditorAccounts(); });
		jQ.append(jQCreditorSaveButton);
		
		// Sets focus on first input field
		this.inputBic.getJQ().find('input').focus();
	}
};

CreditorAccountModule.prototype.addNewAccount = function(){
	//if BIC/IBAN filled and valid
	var that = this;
	var valid = Util.checkStringNotEmpty(this.inputBic.getValue()) && Util.checkStringNotEmpty(this.inputIban.getValue());
	valid = this.inputBic.validate() && valid;
	valid = this.inputIban.validate() && valid;
	if (valid){
		var alreadyExist = false;
		this.accountsTable.objectMap.foreach(function(id, acc) {
			if (acc.iban == that.inputIban.getValue()){
				alreadyExist = true;
			}
		});
		if (alreadyExist){
			PopupModule.getInstance().show({
				'title' : I18n.get('creditor.accounts.error.alreadyExistT'),
				'content' : I18n.get('creditor.accounts.error.alreadyExist'),
				'button0' : { 'text' : 'OK' }
			});
			return;
		}
		this.accountsTable.objectMap.put(this.accountsTable.objectMap.size, {'bic':this.inputBic.getValue(), 'iban':this.inputIban.getValue(), 'byDefault':this.accountsTable.objectMap.size==0});
		this.inputBic.setValue("").buildJQ();
		this.inputIban.setValue("").buildJQ();
		this.accountsTable.buildJQ();
	} else {
		PopupModule.getInstance().show({
			'title' : I18n.get('creditor.accounts.error.emtpyOrInvalidT'),
			'content' : I18n.get('creditor.accounts.error.emtpyOrInvalid'),
			'button0' : { 'text' : 'OK' }
		});
	}
};

CreditorAccountModule.prototype.saveCreditorAccounts = function() {
	var that = this;
	
	var cred = new Object();
	cred.id = this.creditor.id;
	cred.accounts = [];
	this.accountsTable.objectMap.foreach(function(id, acc) {
		cred.accounts.push(acc);
	});
	
	AjaxManager.postJSON('saveAccounts', {
		'creditor' : JSON.stringify(cred)
	}, function(result) {
		if (result.success){
			that.creditor.accounts = result.accounts;
			PopupModule.getInstance().show({
				'title' : I18n.get('creditor.accounts.save.successT'),
				'content' : I18n.get('creditor.accounts.save.success'),
				'button0' : { 'text' : 'OK' }
			});
			NavigationManager.reload();
		} else {
			//popup is handled by AjaxManager
		}
	});
};

CreditorAccountModule.prototype.selectDefault = function(account) {
	this.accountsTable.objectMap.foreach(function(id, acc) {
		acc.byDefault = false;
	});
	account.byDefault = true;
	this.accountsTable.buildJQ();
};

CreditorAccountModule.prototype.setCreditor = function(creditor) {
	this.creditor = creditor;
	if (!Util.checkObject(this.creditor)) {
		return;
	}
	if (!Util.checkArray(this.creditor.accounts)) {
		this.creditor.accounts = [];
	}
	this.accountsTable.objectMap = new Map();
	for (var i=0; i<this.creditor.accounts.length; i++) {
		this.accountsTable.objectMap.put(this.accountsTable.objectMap.size, this.creditor.accounts[i]);
	}
};

/**
 * Loads the creditor and accounts from creditor parameter
 */
CreditorAccountModule.prototype.loadData = function(callback) {
	this.setCreditor(this.parameters.referrer);
	Util.getFunction(callback)();
};
