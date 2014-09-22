/**
 * Object.js
 *
 * Extends the Object object.
 *
 * @author Maxime Ollagnier
 */
/**
 * Copies the given object
 */
Object.copy = function clone(obj) {
	if (null == obj || typeof obj != "object") {
		return obj;
	}
	// Handle Date
	if (obj instanceof Date) {
		var copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}
	// Handle Array
	if (obj instanceof Array) {
		var copy = [];
		for ( var i = 0; i < obj.length; i++) {
			copy[i] = Object.copy(obj[i]);
		}
		return copy;
	}
	// Handle Object
	if (obj instanceof Object) {
		var copy = {};
		for ( var attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = Object.copy(obj[attr]);
			}
		}
		return copy;
	}
	Logger.error('Unable to copy obj. Its type is not supported.');
};

/**
 * Returns the unique id of the object
 */
Object.getUniqueId = function(object) {
	var id = Util.getClassName(object);
	if(Util.check(object.id)) {
		id = object.id + '-' + id;
	}
	return id;
};

/**
 * Returns the id of the object from the specified unique id
 */
Object.parseUniqueId = function(uniqueId) {
	return uniqueId.split('-')[0];
};

/**
 * Compares two variables
 * @param x
 * @param y
 * @returns {Boolean} True if the two parameters are objects with the same attributes
 */
Object.equal = function(x, y) {
	
	if (x === y) return true;
	if (!(x instanceof Object) || !(y instanceof Object)) return false;
	if (x.constructor !== y.constructor) return false;
	
	for (var p in x) {
		if (!x.hasOwnProperty(p)) continue;
	    if (!y.hasOwnProperty(p)) return false;
	    if (x[p] === y[p]) continue;
	    if (typeof(x[p]) !== "object") return false;
	    if (!Object.equals(x[p], y[p])) return false;
	}
	
	for (p in y) {
		if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
	}
	return true;
};

/**
 * Sorts the specified object by its attributes values
 * @param object
 */
Object.sortByValue = function(object) {
	
	if (!Util.checkObject(object)) {
		return;
	}

	var sortable = [];
	for (var key in object) {
		sortable.push([key, object[key]]);
	}
	sortable.sort(function(a, b){
		if (Util.checkFunction(a[1].compare)) {
			return a[1].compare(b[1]);
		}
		return a[1] > b[1];
	});
	
	var sortedObject = {};
	for (var i = 0; i < sortable.length; i++) {
		sortedObject[sortable[i][0]] = sortable[i][1];
	}
	
	return sortedObject;
};
