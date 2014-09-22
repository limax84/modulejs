/**
 * Class UsersPage.
 * 
 * @author Maxime Ollagnier
 */
UsersPage.inherits(Module);
function UsersPage() {
	
	var that = this;
	
	/** Inputs modules */
	this.inputEmail = new InputTextModule({
		'label' : I18n.get('email'),
		'placeholder' : I18n.get('email'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT_SEARCH,
		'onEnter' : function() { that.searchUsers(); }
	});
	this.inputName = new InputTextModule({
		'label' : I18n.get('name'),
		'placeholder' : I18n.get('name'),
		'validationPattern' : ValidationPattern.VALID_DEFAULT_SEARCH,
		'onEnter' : function() { that.searchUsers(); }
	});
	this.inputReferrer = new InputReferrerModule({
		'label' : I18n.get('entity'),
		'value' : UserManager.user.referrer,
		'rootReferrer' : UserManager.user.referrer
	});
	this.inputReferrer.selectUniqueCreditor();
	
	/** Result table module */
	this.userTable = new TableModule();
	this.userTable.columnList.push(new Column('email', I18n.get('email'), '25%', true));
	this.userTable.columnList.push(new Column('name', I18n.get('name'), '25%', true));
	var referrerColumn = new Column('referrer', I18n.get('entity'), '25%');
	this.userTable.columnList.push(referrerColumn);
	referrerColumn.getText = function(user) {
		var referrer = UserManager.getReferrer(user.referrerId);
		if (Util.checkObject(referrer)) {
			return referrer.name;
		}
		return '';
	};
	var profilesColumn = new Column('profiles', I18n.get('profiles'), '25%');
	this.userTable.columnList.push(profilesColumn);
	profilesColumn.getText = function(user) {
		var groups = '';
		for (var i = 0; i < user.groups.length; i++) {
			groups += (i == 0 ? '' : '; ') + I18n.get(user.groups[i].name, true);
		};
		return groups;
	};
	this.userTable.onClickTr = function(jQTr) {
		NavigationManager.goTo('UserModule?id=' + jQTr.attr('id'));
	};
}

UsersPage.neededRoles = ["ROLE_USER", "MANAGE_USER"];

UsersPage.prototype.fillJQ = function(jQ) {
	var that = this;
	
	// Title
	jQ.append($('<h4>' + I18n.get('user.search.title') + '</h4>'));
	
	// Form
	var form = $('<div class="form well row-fluid"></div>');
	jQ.append(form);
	
	var columnLeft = $('<div class="span6"></div>');
	columnLeft.append(this.inputEmail.buildJQ());
	columnLeft.append(this.inputReferrer.buildJQ());
	var columnRight = $('<div class="span6"></div>');
	columnRight.append(this.inputName.buildJQ());
	form.append(columnLeft).append(columnRight);
	
	// Buttons
	var buttonRow = $('<div class="btn-row"></div>');
	form.append(buttonRow);
	
	var buttonSearch = $('<div class="btn search">' + I18n.get('search') + '</div>');
	buttonSearch.click(function() { that.searchUsers(); });
	buttonRow.append(buttonSearch);
	
	var buttonNew = $('<div class="btn new">' + I18n.get('user.new') + '</div>');
	buttonNew.click(function() { that.createNewUser(); });
	buttonRow.append(buttonNew);
	
	// Sets focus on first input field
	this.inputEmail.getJQ().find('input').focus();
	
	// Result table
	var result = $('<div class="result"></div>');
	result.append($('<br/>'));
	result.append($('<h4>' + I18n.get('user.search.list') + '</h4>'));
	if (this.userTable.objectMap.size == 0) {
		result.hide();
	}
	result.append(this.userTable.buildJQ());
	jQ.append(result);
};

/**
 * TODO Comment
 */
UsersPage.prototype.searchUsers = function() {
	if (!this.validate()) {
		return;
	}
	var that = this;
	AjaxManager.getJSON('getUsers', {
		'email' : this.inputEmail.value,
		'name' : this.inputName.value,
		'referrerId' : Util.getObject(this.inputReferrer.value).id
	}, function(result) {
		if (result.success) {
			that.getJQ().find('.result:first').show();
			that.userTable.objectMap = new Map();
			for (var i = 0; i < result.users.length; i++) {
				that.userTable.objectMap.put(result.users[i].id, result.users[i]);
			}
			that.userTable.buildJQ();
		}
	});
};

/**
 * TODO Comment
 */
UsersPage.prototype.createNewUser = function() {
	NavigationManager.goTo('UserModule');
};