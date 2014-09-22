/**
 * Class ReferrersPage.
 * 
 * @author Maxime Ollagnier
 */
ReferrersPage.inherits(Module);
function ReferrersPage() {
	var that = this;
	
	/** Inputs modules */
	this.inputCreditorIcs = new InputTextModule({
		'label' : I18n.get('creditor.ics'),
		'placeholder' : I18n.get('creditor.ics'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'onKeyUp' : function() { that.refreshTree(); }
//		'onEnter' : function() { that.refreshTree(); } Switch from "onKeyUp" to "onEnter" if performance issues need to
	});
	this.inputCreditorNne = new InputTextModule({
		'label' : I18n.get('creditor.nne'),
		'placeholder' : I18n.get('creditor.nne'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'onKeyUp' : function() { that.refreshTree(); }
//		'onEnter' : function() { that.refreshTree(); }
	});
	this.inputReferrerName = new InputTextModule({
		'label' : I18n.get('referrer.name'),
		'placeholder' : I18n.get('referrer.name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'onKeyUp' : function() { that.refreshTree(); }
//		'onEnter' : function() { that.refreshTree(); }
	});
	this.inputCreditorStatus = new InputSelectModule({
		'label' : I18n.get('status'),
		'options' : EnumManager.CreditorStatus
	});
	
	/** Referrer tree module */
	this.inputReferrer = new InputReferrerModule({
		'rootReferrer' : UserManager.user.referrer,
		'popupMode' : false,
		'onSelect' : function(referrer) {
			that.selectReferrer(referrer);
		}
	});
	this.inputReferrer.selectUniqueCreditor();
}

ReferrersPage.neededRoles = ["ROLE_USER", "VIEW_CREDITOR"];

ReferrersPage.prototype.fillJQ = function(jQ) {
	var that = this;

	// Title
	jQ.append($('<h4>' + I18n.get('referrer.search.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well row-fluid"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputReferrerName.buildJQ());
	columnLeft.append(this.inputCreditorStatus.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputCreditorIcs.buildJQ());
	columnRight.append(this.inputCreditorNne.buildJQ());
	form.append(columnLeft).append(columnRight);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.refreshTree(); });
	buttonRow.append(buttonSearch);
	
	if (UserManager.user.referrer.type != InputReferrerModule.TYPE_CREDITOR){
		var buttonNewEntity = $('<div class="btn new">' + I18n.get('entity.new') + '</div>');
		buttonNewEntity.click(function() { that.createNewEntity(); });
		buttonRow.append(buttonNewEntity);
		
		var buttonNewCreditor = $('<div class="btn new">' + I18n.get('creditor.new') + '</div>');
		buttonNewCreditor.click(function() { that.createNewCreditor(); });
		buttonRow.append(buttonNewCreditor);
	}
	
	// Sets focus on first input field
	this.inputReferrerName.getJQ().find('input').focus();
	
	// Result tree
	var treeTitle = $('<h4>' + I18n.get('referrer.search.tree') + '<i class="icon-plus icon"/><i class="icon-minus icon"/></h4>');
	jQ.append(treeTitle);
	treeTitle.find('i.icon-plus').click(function() {
		that.inputReferrer.expandAll(true);
	});
	treeTitle.find('i.icon-minus').click(function() {
		that.inputReferrer.expandAll(false);
	});
	var result = $('<div class="well cropbottom result"></div>');
	result.append(this.inputReferrer.buildJQ());
	jQ.append(result);
};

ReferrersPage.prototype.refreshTree = function() {
	this.inputReferrer.setFilter({
		'name' : this.inputReferrerName.value,
		'ics' : this.inputCreditorIcs.value,
		'nne' : this.inputCreditorNne.value,
		'status' : this.inputCreditorStatus.value
	});
	this.inputReferrer.buildJQ();
};

ReferrersPage.prototype.selectReferrer = function(referrer){
	NavigationManager.goTo('ReferrerPage?referrerId=' + referrer.id + '&type=' + referrer.type);
};

ReferrersPage.prototype.createNewEntity = function(referrer){
	NavigationManager.goTo('ReferrerPage?type=entity');
};

ReferrersPage.prototype.createNewCreditor = function(referrer){
	NavigationManager.goTo('ReferrerPage?type=creditor');
};
