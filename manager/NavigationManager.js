/**
 * Static class NavigationManager. Handles site navigation, navigation history,
 * etc...
 * See the plugin site : http://www.asual.com/jquery/address/
 * 
 * @author Maxime Ollagnier
 */
NavigationManager = function() {
};

/** Base URI */
NavigationManager.BASE_URI = "/new/";

/** Default page */
NavigationManager.DEFAULT_PAGE = "MandatesPage";

/**
 * Requests the display of the appropriate page
 */
NavigationManager.requestPageDisplay = function(address) {
	
	// Retrieves the address from the event
	if (Util.check(address.value)) {
		address = unescape(address.value);
	}
	while (address.indexOf('/') == 0) {
		address = address.substring(1);
	}
	address = address.split('?');
	
	// Retrieves the page name
	var pageName = '';
	if (address.length > 0) {
		pageName = address[0];
	}
	
	// Retrieves the parameter array
	var parameterArray = [];
	if (address.length > 1) {
		parameterArray = address[1].split('&');
	}
	
	// Builds the parameter object
	var parameters = {};
	for (var i = 0; i < parameterArray.length; i++) {
		var parameter = parameterArray[i].split('=');
		if (parameter.length == 2 && parameter[0] != '') {
			parameters[parameter[0]] = parameter[1];
		}
	}
	
	// If no page name is given, then the default one is used
	if (!Util.checkStringNotEmpty(pageName)) {
		pageName = NavigationManager.DEFAULT_PAGE;
	}
	
	// Retrieves the appropriate page
	var page = window[pageName];
	if (!Util.checkFunction(page)) {
		console.error('Could not retrieve the page "' + pageName + '".');
	}
	// Requests the load of the page
	else {
		NavigationManager.getJQPage().clear();
		page.getInstance().load(parameters, function(jQ) {
			NavigationManager.getJQPage().append(jQ);
		});
	}
};

/**
 * Returns the jQuery page content where the actual page content should be appended
 */
NavigationManager.getJQPage = function() {
	return $('#page #content');
};

/**
 * Redirect to the given address. Here the address is the hashtag part of the URL
 */
NavigationManager.goTo = function(address) {
	$.history.load(address);
};

/**
 * Get the URI as a String.
 * This method returns the URI part following the '#' tag of the current address
 */
NavigationManager.getURI = function() {
	return decodeURIComponent(document.URL.substring(document.URL.indexOf('#') + 1));
};

/**
 * Reload the current page (current URL).
 */
NavigationManager.reload = function(URI) {
	if (!Util.checkString(URI)) {
		URI = NavigationManager.getURI();
	}
	if (URI.lastIndexOf('?reload=') > 0) {
		URI = URI.substring(0, URI.lastIndexOf('?reload='));
	}
	URI = URI + '?reload=' + new Date().getTime();
	$.history.load(URI);
};

/**
 * Redirect backward in the navigation history
 */
NavigationManager.back = function() {
	history.back();
};

/**
 * IMPORTANT ! Initializes the jQuery address plugin
 */
NavigationManager.init = function() {
	$.history.init(NavigationManager.requestPageDisplay);
};

/**
 * Get the customer
 */
NavigationManager.getCustomer = function() {
	if (document.URL.indexOf('/display/') < 0) return '';
	return document.URL.substring(document.URL.indexOf('/display/') + '/display/'.length);
};

/**
 * Get the logout URI
 */
NavigationManager.getLogoutURI = function() {
	return NavigationManager.BASE_URI + "logout?customer=" + NavigationManager.getCustomer();
};
