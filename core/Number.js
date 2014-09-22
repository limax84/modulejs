/**
 * Number.js
 *
 * Extends the Number object.
 *
 * @author Maxime Ollagnier
 */
/**
 * Returns this Number as a String formatted with 'digit' digits after the 'separator'.
 */
Number.prototype.format = function(digit, separator)
{
    if (typeof digit != 'number' || digit > 99) 
    {
        throw new Error('Number.toFormattedString - Wrong argument.');
    }
    var decimals = Math.round(((this - Math.floor(this)) * Math.pow(10, digit))).toString();
    while (digit - decimals.length > 0) 
    {
        decimals = '0' + decimals;
    }
    if (typeof separator != 'string' || separator.length != 1) 
    {
        separator = '.';
    }
    return Math.floor(this).toString() + separator + decimals.substr(0, digit);
};
