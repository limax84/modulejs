/**
 * Class I18n.
 * Handles site i18n
 *
 * @author Maxime Ollagnier
 */
function I18n() {
}


/** Displayed when no i18n key is specified */
I18n.EMPTY_I18N_KEY = '';

/**
 * Returns the i18n of the given key.
 * If the key is undefined, null or empty, I18n.EMPTY_I18N_KEY will be returned.
 * If the i18n of the key is not found , the key itself will be returned within two markers : "+".
 * If the parameter "optional" is not set to true, no marker will be used.
 */
I18n.get = function(key, isOptional, arguments) {
	if (!Util.checkStringNotEmpty(key)) {
		return I18n.EMPTY_I18N_KEY;
	}
	if (!Util.checkObject(i18n) || !Util.checkString(i18n[key])) {
		Util.assertWarn(Util.checkObject(i18n), true, 'No i18n object found.');
		if (isOptional) {
			return key;
		}
		return '+' + key + '+';
	}
	
	var i18nValue = i18n[key];
	
	if (Util.checkArray(arguments)) {
		$.each(arguments, function(index, value) {
			i18nValue = i18nValue.replace("{}", value);
		});
	}
	return i18nValue;
};