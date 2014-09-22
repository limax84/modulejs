/**
 * Class Element.
 * Defines the Element class wrapping the object tu put into the List.
 *
 * @author Maxime Ollagnier
 */
Element = function(parentList, object, previousElement, nextElement)
{
    this.value = object;
    this.previousElement = previousElement;
    this.nextElement = nextElement;
    this.parentList = parentList;
};

/**
 * Checks if the is no previous Element.
 */
Element.prototype.isFirst = function()
{
    return !this.previousElement;
};

/**
 * Checks if there is no next Element.
 */
Element.prototype.isLast = function()
{
    return !this.nextElement;
};

/**
 * Class List.
 * Defines the base List class.
 *
 * @author Maxime Ollagnier
 */
List.inherits(Collection);
function List()
{
    this.size = 0;
    this.firstElement = undefined;
    this.lastElement = undefined;
};

/**
 * Pushes the given object into this List.
 */
List.prototype.push = function(object)
{
    if (object) 
    {
        var element = new Element(this, object);
        if (this.size == 0) 
        {
            this.firstElement = element;
            this.lastElement = element;
        }
        else 
        {
            element.previousElement = this.lastElement;
            this.lastElement.nextElement = element;
            this.lastElement = element;
        }
        this.size++;
    }
};

/**
 * Removes the last object of this List and returns it.
 */
List.prototype.pop = function()
{
    if (this.size == 0) 
    {
        return undefined;
    }
    var object = this.lastElement.value;
    if (this.size == 1) 
    {
        this.lastElement = undefined;
        this.firstElement = undefined;
    }
    else 
    {
        this.lastElement = this.lastElement.previousElement;
        this.lastElement.nextElement = undefined;
    }
    this.size--;
    return object;
};

/**
 * Returns the object at the given index position in this List.
 */
List.prototype.get = function(index)
{
    if (index == undefined || index < 0 || index >= this.size) 
    {
        throw new Error('Wrong index argument.');
    }
    var element = this.firstElement;
    for (var i = 0; i < index; i++) 
    {
        element = element.nextElement;
    }
    return element.value;
};

/**
 * Returns the first object in this List.
 */
List.prototype.getFirst = function()
{
    if (this.size == 0) 
    {
        return undefined;
    }
    return this.firstElement.value;
};

/**
 * Returns the last object in this List.
 */
List.prototype.getLast = function()
{
    if (this.size == 0) 
    {
        return undefined;
    }
    return this.lastElement.value;
};

/**
 * Removes the object at the given index position in this List.
 */
List.prototype.remove = function(index)
{
    if (index == undefined || index >= this.size) 
    {
        throw new Error('Wrong index argument');
    }
    var element = this.firstElement;
    for (var i = 0; i < index; i++) 
    {
        element = element.nextElement;
    }
    if (element != this.firstElement) 
    {
        element.previousElement.nextElement = element.nextElement;
    }
    else 
    {
        this.firstElement = element.nextElement;
    }
    if (element != this.lastElement) 
    {
        element.nextElement.previousElement = element.previousElement;
    }
    else 
    {
        this.lastElement = element.previousElement;
    }
    this.size--;
    return element.value;
};

/**
 * Removes all object in this List.
 */
List.prototype.clear = function()
{
    this.size = 0;
    this.firstElement = undefined;
    this.lastElement = undefined;
};

/**
 * Checks of the given object exists in this List.
 */
List.prototype.contains = function(object)
{
    var element = this.firstElement;
    for (var i = 0; i < this.size; i++) 
    {
        if (element.value == object) 
        {
            return true;
        }
        element = element.nextElement;
    }
    return false;
};

/**
 * Loops executing for each element the given callback(index, object) function.
 */
List.prototype.foreach = function(callback)
{
    if (callback) 
    {
        var element = this.firstElement;
        for (var i = 0; i < this.size; i++) 
        {
            callback(i, element.value);
            element = element.nextElement;
        }
    }
};

/**
 * Modifies this List reversing the order of its object.
 */
List.prototype.reverse = function()
{
    var element = this.firstElement;
    for (var i = 0; i < this.size; i++) 
    {
        var tmpElement = element.nextElement;
        element.nextElement = element.previousElement;
        element.previousElement = tmpElement;
        element = element.previousElement;
    }
    var tmpElement = this.lastElement;
    this.lastElement = this.firstElement;
    this.firstElement = tmpElement;
    return this;
};
