/**
 * Class Bean. Parent class of bean objects for AJAX uses.
 * 
 * @author Maxime Ollagnier
 */
function Bean() {
};

/**
 * Returns the id.
 */
Bean.prototype.getId = function() {
	if (this.id == undefined) {
		throw new Error(
				'Bean\'s id attribute or getId() method should be defined.');
	}
	return this.id;
};

/**
 * Returns the JSON object.
 */
Bean.prototype.getJSON = function() {
	var json = {};
	for ( var id in this) {
		if (typeof this[id] != 'undefined' && typeof this[id] != 'function'
				&& id != 'parent') {
			if (typeof this[id].getJSON == 'function') {
				json[id] = this[id].getJSON();
			} else {
				json[id] = this[id];
			}
		}
	}
	return json;
};
