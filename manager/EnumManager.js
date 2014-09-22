/**
 * Class EnumManager. Handles the synchronization of Enum type with server
 * 
 * @author Maxime Ollagnier
 */
EnumManager = function() {
};

/**
 * Initializes every needed Enum types from server
 */
EnumManager.init = function(callback) {
	AjaxManager.getJSON('getEnums', {}, function(result) {
		if (result.success) {
			$.each(result.enums, function(enumName, enumObject) {
				EnumManager[enumName] = enumObject;
			});
		}
		else {
			console.warn('Failed to retrieve enum types from server.');
		}
		Util.getFunction(callback)();
	});
};