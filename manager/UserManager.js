/**
 * Static class UserManager. Handles functionality access
 * 
 * @author Maxime Ollagnier
 */

UserManager = function() {
};

/** Currently logged user */
UserManager.user = undefined;

/** Available role group map */
UserManager.groupMap = undefined;

/** Referrer types */
UserManager.TYPE_CREDITOR = 'creditor';
UserManager.TYPE_ENTITY = 'not creditor';

/** User types */
UserManager.USER_TYPE_VALUES = {};
UserManager.USER_TYPE_VALUES['CREDITOR'] = 10;
UserManager.USER_TYPE_VALUES['ORGENTITY'] = 20;
UserManager.USER_TYPE_VALUES['BACKOFFICE'] = 30;

/**
 * Initializes the currently logged user
 */
UserManager.init = function(callback) {
	AjaxManager.getJSON('getUser', {}, function(result) {
    	if (result.success) {
			UserManager.user = result.user;
			AjaxManager.getJSON('getGroups', {}, function(result) {
		    	if (result.success) {
					UserManager.groupMap = {};
					for (var i = 0; i < result.groups.length; i++) {
						UserManager.groupMap[result.groups[i].id] = result.groups[i];
					};
					Util.getFunction(callback)();
				}
			});
		}
	});
};

/**
 * Returns the userType of the referrer
 * @param referrer
 */
UserManager.getUserType = function(referrer) {
	var userType = EnumManager.UserType.CREDITOR;
	if (Util.checkObject(referrer)) {
		if (referrer.type != UserManager.TYPE_CREDITOR) {
			userType = EnumManager.UserType.ORGENTITY;
		}
		if (!Util.check(referrer.parentId)) {
			userType = EnumManager.UserType.BACKOFFICE;
		}
	}
	return userType;
};

/**
 * Returns the map of groups with the given user type
 */
UserManager.getGroupMap = function(userType) {
	var groupMap = {};
	$.each(UserManager.groupMap, function(groupId, group) {
		if (UserManager.USER_TYPE_VALUES[group.userType] <= UserManager.USER_TYPE_VALUES[userType]) {
			groupMap[groupId] = group;
		}
	});
	return groupMap;
};

/**
 * Returns true if every given role is contained in the currently logged user roles
 */
UserManager.hasRoles = function(roles) {
	for (var i = 0; i < roles.length; i++) {
		if (!UserManager.hasRole(roles[i])) {
			return false;
		}
	}
	return true;
};

/**
 * Returns true if the given role is contained in the currently logged user roles
 */
UserManager.hasRole = function(role) {
	var contained = false;
	for (var i = 0; i < UserManager.user.groups.length; i++) {
		for (var j = 0; j < UserManager.user.groups[i].roles.length; j++) {
			contained = contained || UserManager.user.groups[i].roles.contains(role);
		}
	}
	return true;
};

/**
 * Returns the merged list of roles for the given map of groups of list of groups ids
 */
UserManager.getRoles = function(groupMapOrGroupIds) {
	var roles = [];
	if (Util.checkArray(groupMapOrGroupIds)) {
		for (var j = 0; j < groupMapOrGroupIds.length; j++) {
			var group = UserManager.groupMap[groupMapOrGroupIds[j]];
			for (var i = 0; i < group.roles.length; i++) {
				if (!roles.contains(group.roles[i])) {
					roles.push(group.roles[i]);
				}
			}
		}
	} else if (Util.checkObject(groupMapOrGroupIds)) {
		$.each(groupMapOrGroupIds, function(groupId, group) {
			for (var i = 0; i < group.roles.length; i++) {
				if (!roles.contains(group.roles[i])) {
					roles.push(group.roles[i]);
				}
			}
		});
	}
	return roles.sort();
};

/**
 * Returns the referrer with the given ID if accessible
 * 
 * @param referrerId the id of the referrer to get
 * @param parentReferrer is used by this method for recursion (optional for usage)
 */
UserManager.getReferrer = function(referrerId, parentReferrer) {
	if (!Util.checkObject(parentReferrer)) {
		parentReferrer = UserManager.user.referrer;
	}
	if (parentReferrer.id == referrerId) {
		return parentReferrer;
	}
	if (parentReferrer.type == UserManager.TYPE_CREDITOR) {
		return undefined;
	}
	for (var i = 0; i < parentReferrer.children.length; i++) {
		var foundReferrer = UserManager.getReferrer(referrerId, parentReferrer.children[i]);
		if (Util.checkObject(foundReferrer)) {
			return foundReferrer;
		}
	}
	return undefined;
};

/**
 * Sets the referrer with the given ID if possible
 * 
 * @param referrer the new referrer to be set
 * @param parentReferrer is used by this method for recursion (optional for usage)
 */
UserManager.setReferrer = function(referrer, parentReferrer) {
	if (UserManager.user.referrer.id == referrer.id) {
		UserManager.user.referrer = referrer;
		return true;
	}
	if (!Util.checkObject(parentReferrer)) {
		parentReferrer = UserManager.user.referrer;
	}
	var foundAndSet = false;
	if (parentReferrer.type != UserManager.TYPE_CREDITOR) {
		for (var i = 0; i < parentReferrer.children.length && !foundAndSet; i++) {
			if (parentReferrer.children[i].id == referrer.id && (
					(parentReferrer.children[i].type != UserManager.TYPE_CREDITOR && referrer.type != UserManager.TYPE_CREDITOR) ||
					(parentReferrer.children[i].type == UserManager.TYPE_CREDITOR && referrer.type == UserManager.TYPE_CREDITOR)
					)
				) {
				parentReferrer.children[i] = referrer;
				return true;
			} else if (parentReferrer.children[i].type != UserManager.TYPE_CREDITOR) {
				foundAndSet = UserManager.setReferrer(referrer, parentReferrer.children[i]);
			}
		}
		if (!foundAndSet && referrer.parentId == parentReferrer.id) {
			parentReferrer.children.push(referrer);
			return true;
		}
	}
	return false;
};
