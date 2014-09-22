/**
 * JQuery.js
 *
 * Extends the jQuery functionnalities.
 *
 * @author Maxime Ollagnier
 */

/**
 * Clears every bindings of the elements and empties it
 */
$.fn.clear = function() {
	$(this).children().detach();
	return $(this);
};