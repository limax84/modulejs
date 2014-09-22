/**
 * Class EntityInfoModule.
 * 
 * @author Maxime Ollagnier
 */

EntityInfoModule.inherits(Module);
function EntityInfoModule() {
	this.entity = undefined;

	this.inputName = new InputTextModule({
		'label' : I18n.get('name'),
		'placeholder' : I18n.get('name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT,
		'mandatory' : true
	});
	this.inputParent = new InputReferrerModule({
		'label' : I18n.get('entity.parent'),
		'selectableType' : InputReferrerModule.TYPE_ENTITY,
		'mandatory' : true
	});
	this.inputType = new InputSelectModule({	
		'label' : I18n.get('type'),
		'options' : EnumManager.EntityType
	});
}

EntityInfoModule.neededRoles = function() {
	return ["ROLE_USER", "VIEW_ORGANIZATION_ENTITY"];
};

EntityInfoModule.prototype.fillJQ = function(jQ) {
	var that = this;
	
	jQ.append($('<h5>' + I18n.get('infos') + '</h5>'));

	var jQForm = $('<div class="form well cropbottom row-fluid"></div>');
	jQ.append(jQForm);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputName.buildJQ());
	if (this.entity != UserManager.user.referrer) {
		columnLeft.append(this.inputParent.buildJQ());
	} else {
		this.inputParent.setMandatory(false);
	}
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputType.buildJQ());
	jQForm.append(columnLeft).append(columnRight);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	jQForm.append(buttonRow);
	
	var buttonSave = $('<div class="btn save">' + I18n.get('save') + '</div>');
	buttonSave.click(function() { that.save(); });
	buttonRow.append(buttonSave);
};

/**
 * Loads the entity directly from the parameters
 */
EntityInfoModule.prototype.loadData = function(callback) {
	this.setEntity(this.parameters.referrer);
	Util.getFunction(callback)();
};

/**
 * Sets the entity
 */
EntityInfoModule.prototype.setEntity = function(entity) {
	this.entity = entity;
	if (!Util.checkObject(this.entity)) {
		return;
	}

	this.inputName.setValue(this.entity.name);
	this.inputParent.setValue(UserManager.getReferrer(this.entity.parentId));
	this.inputParent.setDisabledReferrers([this.entity]);
	this.inputType.setValue(this.entity.type);
};

/**
 * Sets the entity
 */
EntityInfoModule.prototype.save = function() {
	var that = this;
	if (!this.validate()) {
		return false;
	}
	
	var entity = {};
	if (Util.checkObject(this.entity)) {
		entity.id = this.entity.id;
	}
	entity.name = this.inputName.value;
	entity.type = this.inputType.value;
	if (Util.checkObject(this.inputParent.value)) {
		entity.parentId = this.inputParent.value.id;
	}
		
	AjaxManager.getJSON('saveEntity', {
		'entity' : JSON.stringify(entity)
	}, function(result) {
		if (result.success) {
			PopupModule.getInstance().clear();
			PopupModule.getInstance().setTitle(I18n.get('success'));
			PopupModule.getInstance().setContent(I18n.get('entity.saved'));
			PopupModule.getInstance().addButton('OK');
			UserManager.setReferrer(result.entity);
			if (Util.checkObject(that.entity)) {
				result.entity.expanded = that.entity.expanded;
				that.load({ 'referrer' : result.entity }, function() { PopupModule.getInstance().show(); });
			} else {
				NavigationManager.goTo('ReferrerPage?referrerId=' + result.entity.id + '&type=' + result.entity.type);
				PopupModule.getInstance().show();
			}
		}
	});
	return true;
};
