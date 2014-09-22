/**
 * Class Countries.
 * Handles site i18n
 *
 * @author Flavio Duboc
 */
function Countries() {
}

/** Displays a warning if no countries object is provided */
Util.assertWarn(Util.checkObject(countries), true, 'No countries object found.');

Countries.getAll = function() {
	return countries;
};
