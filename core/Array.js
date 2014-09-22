/**
 * Array.js
 *
 * Extends the Array object.
 *
 * @author Maxime Ollagnier
 */
/**
 * Check if the given element exists in this array.
 */
Array.prototype.contains = function(element) {
	for ( var i = 0; i < this.length; i++) {
		if (this[i] == element) {
			return true;
		}
	}
	return false;
};

/**
 * Removes the given element from this array.
 */
Array.prototype.remove = function(element) {
	var res = false;
	for ( var i = 0; i < this.length; i++) {
		if (this[i] == element) {
			this.splice(i--, 1);
			res = true;
		}
	}
	return res;
};

/**
 * Pushes the given value in the first position of the array
 */
Array.prototype.pushFront = function(element) {
	this.reverse().push(element);
	return this.reverse();
};
