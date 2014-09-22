/**
 * Class Property.
 * Handles site properties
 *
 * @author Maxime Ollagnier
 */
function Property() {
}

/**
 * Returns the String value of the given key.
 * If the key is undefined, null or empty an exception is thrown.
 * If the property is not found, the defaultValue is returned if specified, an exception would be thrown otherwise.
 */
Property.get = function(key, defaultValue) {
    if (!Util.checkStringNotEmpty(key)) {
        throw 'Property\'s key must be specified.';
    }
    if (!Util.checkObject(properties) || !Util.checkString(properties[key])) {
    	Util.assertWarn(Util.checkObject(properties), true, 'No properties object found.');
        if (Util.check(defaultValue)) {
            return defaultValue;
        }
        throw 'Property [' + key + '] missing.';
    }
    return properties[key];
};