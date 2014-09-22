/**
 * Class Collection. Defines the base Collection class.
 * 
 * @author Maxime Ollagnier
 */
function Collection() {
};

/**
 * Loops executing for each element the given callback(key, object) function.
 */
Collection.prototype.foreach = function(callback) {
	throw new Error(this.className + '.foreach() method is not defined.');
};

/**
 * Returns the JSON object.
 */
Collection.prototype.getJSON = function() {
	var json = new Array();
	this.foreach(function(key, object) {
		if (object) {
			if (typeof object.getJSON == 'function') {
				json.push(object.getJSON());
			} else {
				json.push(object);
			}
		}
	});
	return json;
};

/**
 * Returns the String representation.
 */
Collection.prototype.toString = function() {
	var res = '[';
	this.foreach(function(key, object) {
		if (object) {
			if (typeof object.toString == 'function') {
				res += object.toString();
			} else {
				res += object;
			}
			res += ', ';
		}
	});
	if (this.size > 0) {
		res = res.substring(0, res.length - 2);
	}
	res += ']';
	return res;
};
