/**
 * String.js
 *
 * Extends the String object.
 *
 * @author Maxime Ollagnier
 */

/**
 * Returns the given string with its first letter in upper case.
 */
String.prototype.toFirstUpperCase = function()
{
    var str = this.toString();
    if (str != '') 
    {
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
    }
    return str;
};

/**
 * Returns the given string without any space character
 */
String.removeWhiteSpace = function(string)
{
	return string.replace(/\s+/g, '');
};

/**
 * Returns this string embedding the given searchString with the given tag and with the given class
 */
String.prototype.showStr = function(searchString, tag, classe)
{
    var string = this.toString();
    if (typeof searchString == 'string' && searchString != '' && string != '') 
    {
        if (typeof tag != 'string' || tag == '')
        {
            tag = 'b';
        }
        if (typeof classe != 'string') 
        {
            classe = '';
        }
        searchString = searchString.toLowerCase();
        var startOf = string.toLowerCase().indexOf(searchString);
        if (startOf >= 0) 
        {
            var endOf = startOf + searchString.length;
            var start = string.substring(0, startOf);
            var found = '<' + tag + ' class="' + classe + '">' + string.substring(startOf, endOf) + '</' + tag + '>';
            var end = string.substring(endOf).showStr(searchString, tag, classe);
            string = start + found + end;
        }
    }
    return string;
};

/**
 * Returns the string hashed
 */
String.prototype.hash = function()
{
    var string = this.toString();
    var B = 256;
    var N = 251;
    var r = 0;
    var hash = '';
    for (var i = 0; i < string.length; i++) 
    {
        r = (r * B + string.charCodeAt(i)) % N;
        hash += r.toString(16);
    }
    return hash;
};

String.prototype.replaceAllInMap = function(map)
{
	var string = this.toString();
	if (!Util.checkObject(map)) {
		return string;
	}
	for (var prop in map) {
		string = string.replace(new RegExp(prop, 'g'), map[prop]);
	}
	return string;
};

String.LOCALE_CARACTER_MAP = {
	"[àáâãäå]": "a",
	"[ÀÁÂÃÄÅ]" : "A",
	"[ç]":"c",
	"[Ç]":"C",
	"[èéêë]" : "e",
	"[ÈÉÊË]" : "E",
	"[ìíîï]" : "i",
	"[ÌÍÎÏ]" : "I",
	"[ñ]" : "n",
	"[Ñ]" : "N",
	"[òóôõö]" : "o",
	"[ÒÓÔÕÖ]" : "O",
	"[ùúûü]" : "u",
	"[ÙÚÛÜ]" : "U",
	"[ýÿ]" : "y",
	"[ÝŸ]" : "Y"
};

String.prototype.compare = function(localeString2Compare) {
	var string = this.toLowerCase().replaceAllInMap(String.LOCALE_CARACTER_MAP);
	var string2Compare = localeString2Compare.toLowerCase().replaceAllInMap(String.LOCALE_CARACTER_MAP);
	return string.localeCompare(string2Compare);
};
