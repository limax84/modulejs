/**
 * Class Map. Defines the base Map class.
 *
 * @author Maxime Ollagnier
 */
Map.inherits(Collection);
function Map()
{
    this.size = 0;
    this.map = new Object();
    this.hash = new Array();
};

/**
 * Maps the given object with the given key into this Map.
 */
Map.prototype.put = function(key, value)
{
    if (value && !this.contains(key)) 
    {
        this.size++;
        this.hash.push(key);
    }
    this.map[key] = value;
};

/**
 * Put every elements of the given Map into this Map.
 */
Map.prototype.putAll = function(map)
{
    var that = this;
    map.foreach(function(key, value)
    {
        that.put(key, value);
    });
};

/**
 * Returns the object mapped with the given key.
 */
Map.prototype.get = function(key)
{
    return this.map[key];
};

/**
 * Removes from this Map the object mapped with the given key.
 */
Map.prototype.remove = function(key)
{
    if (this.contains(key)) 
    {
        delete this.map[key];
        this.hash.splice(this.getHash(key), 1);
        this.size--;
        return true;
    }
    return false;
};

/**
 * Returns the index of the object mapped with the given key.
 */
Map.prototype.getHash = function(key)
{
    for (var i = 0; i < this.hash.length; i++) 
    {
        if (this.hash[i] == key) 
        {
            return i;
        }
    }
};

/**
 * Checks if an object is mapped with the given key.
 */
Map.prototype.contains = function(key)
{
    return this.get(key) != undefined;
};

/**
 * Loops executing for each element the given callback(key, object) function.
 */
Map.prototype.foreach = function(callback)
{
    var returnBreak = undefined;
    for (var i = 0; i < this.hash.length && returnBreak != true; i++) 
    {
        var key = this.hash[i];
        if (this.contains(key)) 
        {
            returnBreak = callback(key, this.map[key]);
        }
    }
};

/**
 * Sorts all mapped objects comparing the given attribute in the given sens.
 */
Map.prototype.sort = function(attributeName, reverse)
{
    var that = this;
    this.hash.sort(function(key0, key1)
    {
        var a = that.map[key0];
        if (Util.checkString(attributeName) && Util.check(that.map[key0][attributeName])) 
        {
            a = that.map[key0][attributeName];
        }
        var b = that.map[key1];
        if (Util.checkString(attributeName) && Util.check(that.map[key1][attributeName])) 
        {
            b = that.map[key1][attributeName];
        }
        if (Util.checkString(attributeName) && Util.checkFunction(that.compare[attributeName]))
        {
        	return that.compare[attributeName](a, b);
        }
        if (Util.checkString(a)  && Util.checkString(b))
        {
        	if (a.toLowerCase() > b.toLowerCase())
        	{
        		return 1;
        	}
        	else if (a.toLowerCase() < b.toLowerCase())
        	{
        		return -1;
        	}
    		return 0;
        }
        if (Util.checkNumber(a)  && Util.checkNumber(b))
        {
            return a - b;
        }
		throw "Map sort failed.";
    });
    if (reverse) 
    {
        this.hash.reverse();
    }
};

/**
 * Comparison object.
 * Usage :
 * 
 * myMap.compare['attributeName'] = function(arg1, arg2) {
 * 		return arg1 - arg2;
 * };
 */
Map.prototype.compare = {};
