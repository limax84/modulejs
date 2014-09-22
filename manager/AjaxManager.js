/**
 * Class AjaxManager. Handles Ajax communications.
 * 
 * @author Maxime Ollagnier
 */
AjaxManager = function() {
};

/** Web app base URI */
AjaxManager.BASE_URI = CONTEXT_ROOT + '/new/';

/** Delay in ms before redirecting to login page when session expired */
AjaxManager.SESSION_EXPIRATION_LOGIN_URI_REDIRECTION_TIME = 2000;

/** Cache of the current XmlHTTP requests */
AjaxManager.currentRequests = {};

/** Current processing downloads */
AjaxManager.currentDownloads = {};

/** Current processing form submits */
AjaxManager.currentSubmits = {};

/**
 * Returns the host base URL
 */
AjaxManager.getBaseUrl = function() {
	var baseUrl = document.location.href;
	if (baseUrl.indexOf(AjaxManager.BASE_URI) < 0) {
		console.error('Base URI is incorrect : [' + AjaxManager.BASE_URI + ']');
	}
	return baseUrl.substring(0, baseUrl.indexOf(AjaxManager.BASE_URI)) + AjaxManager.BASE_URI;
};

/**
 * Handles the JSON request. Checks to see if the current request is already
 * being processed and handles errors. if 'silent' parameter is true, no error
 * message is popped to the user (a log is still displayed on console)
 */
AjaxManager.getJSON = function(uri, parameters, callback, silent) {

	// Prevents browser from caching responses
	Util.getObject(parameters).nocache = new Date().getTime();

	// Distinguish ajax requests from browser synchronous requests for session
	// expiration handling purpose
	Util.getObject(parameters).isAjaxRequest = true;

	// Makes the actual AJAX request
	$.getJSON(AjaxManager.BASE_URI + uri, parameters, function() {
	})

	// Handles communication success
	.success(function(result) {
		result = AjaxManager.handleResult(result, silent);
		if (!result.success) {
			// TODO see below AjaxManager.alertErrorServer();
		}
		Util.getFunction(callback)(result);
	})
	// Handles communication error
	.error(function(xhr, ajaxOptions, thrownError) {
		// TODO see below AjaxManager.alertErrorServer();
		Util.getFunction(callback)({
			'success' : false
		});
		if (xhr.status == 499) {
			AjaxManager.sessionExpired();
		}
	});
};

/**
 * Handles an ajax post request and the expected json response if 'silent'
 * parameter is true, no error message is popped to the user (a log is still
 * displayed on console)
 */
AjaxManager.postJSON = function(uri, parameters, callback, silent) {

	// Prevents browser from caching responses
	Util.getObject(parameters).nocache = new Date().getTime();

	// Distinguish ajax requests from browser synchronous requests for session
	// expiration handling purpose
	Util.getObject(parameters).isAjaxRequest = true;

	// Makes the AJAX request
	$.ajax({
		type : "POST",
		dataType : "json",
		url : AjaxManager.BASE_URI + uri,
		data : parameters
	})

	// Handles communication success
	.success(function(result) {
		result = AjaxManager.handleResult(result, silent);
		if (!result.success) {
			// TODO see below AjaxManager.alertErrorServer();
		}
		Util.getFunction(callback)(result);
	})
	// Handles communication error
	.error(function(xhr, ajaxOptions, thrownError) {
		// TODO see below AjaxManager.alertErrorServer();
		Util.getFunction(callback)({
			'success' : false
		});
		if (xhr.status == 499) {
			AjaxManager.sessionExpired();
		}
	});
};

/**
 * Handles the result coming from the server. Displays warning and error
 * messages, sets result.success to true or false and returns it. if 'silent'
 * parameter is true, no error message is popped to the user (a log is still
 * displayed on console)
 */
AjaxManager.handleResult = function(result, silent) {
	result.success = true;
	if (Util.checkArray(result.warnMessages) && result.warnMessages.length > 0) {
		for ( var i = 0; i < result.warnMessages.length; i++) {
			console.warn(result.warnMessages[i]);
		}
	}
	if (Util.checkArray(result.errorMessages)
			&& result.errorMessages.length > 0) {
		// Display the first (main) error message if not silent
		// Test if the error message is a known I18n key
		if (silent != true) {
			var val = I18n.get(result.errorMessages[0], true);
			if (val == result.errorMessages[0]) {
				// if val is not known, display generic error message
				AjaxManager.alertErrorServer(null, result.errorMessages
						.slice(1));
			} else {
				AjaxManager
						.alertErrorServer(val, result.errorMessages.slice(1));
			}
		}
		// log all remaining error messages if any
		for ( var i = 0; i < result.errorMessages.length; i++) {
			// log to the console
			console.error(result.errorMessages[i]);
		}
		result.success = false;
	}
	return result;
};

// TODO Refactor this general error handling
/**
 * Popup an error alert with the given message, or display a default message if
 * no message is given If 'parameters' array exist and is not empty, it is used
 * to display more information about the error
 */
AjaxManager.alertErrorServer = function(message, parameters) {
	var msg;
	if (Util.check(message) && Util.checkString(message)) {
		msg = message;
	} else {
		msg = I18n.get('server.error.popup.content');
	}
	var content;
	if (Util.check(parameters) && Util.checkArray(parameters)
			&& parameters.length > 0) {
		content = $('<div class="popup_err_details">');
		content.append(msg + "<br/>");
		// prepare collapsible content
		var title = $('<span class="popup_err_details_title">'
				+ I18n.get('server.error.popup.details') + '</span>');
		var hd = $('<div class="popup_err_details_content">');
		for ( var i = 0; i < parameters.length; i++) {
			hd.append(parameters[i] + "<br/>");
		}
		// create collapsible content
		var details = new CollapsibleModule({
			'title' : title,
			'content' : hd,
			'showCollapsibleIcon' : 'none'
		});
		content.append(details.buildJQ());
	} else {
		content = msg;
	}
	PopupModule.getInstance().clear();
	PopupModule.getInstance().setTitle(I18n.get('server.error.popup.title'));
	PopupModule.getInstance().setContent(content);
	PopupModule.getInstance().addButton('OK');
	PopupModule.getInstance().show();
};

/**
 * Handles the JSON request. Checks to see if the current request is already
 * being processed and handles errors.
 */
AjaxManager.download = function(uri, parameters, callback) {
	var downloadId = moment().valueOf();
	var iFrameJQ = AjaxManager.buildIFrameJQ(downloadId);
	iFrameJQ.bind('load', function() {
		Util.getFunction(callback)();
	});
	var url = AjaxManager.getBaseUrl() + uri;
	if (Util.checkObject(parameters)) {
		var first = true;
		$.each(parameters, function(key, val) {
			if (first) {
				url += '?';
			} else {
				url += '&';
			}
			first = false;
			url += key + '=' + val;
		});
	}
	iFrameJQ.attr('src', url);
};

/**
 * Submit the given JQ form to the given URI and calls the specified callback.
 * 
 * Here this is a ninja trick to allow form submissions to execute
 * asynchronously a callback method with the server json result. The form's
 * target is set to the name of a brand new iFrame. This iFrame load event is
 * listened to. When the iFrame is loaded with the server response, the
 * specified callback is called.
 */
AjaxManager.submitForm = function(uri, formJQ, callback) {
	var submitId = moment().valueOf();
	formJQ.attr('action', AjaxManager.BASE_URI + uri);
	formJQ.attr('target', submitId);
	var iFrameJQ = AjaxManager.buildIFrameJQ(submitId);
	iFrameJQ.bind('load',
			function() {
				var jsonResult = $($(this).prop('contentDocument'))
						.find('body').text();
				if (!Util.check($(this).prop('contentDocument'))) {
					jsonResult = $($(this).prop('contentWindow').document)
							.find('body').text(); // For stupid IE
				}
				var result = {};
				if (Util.checkStringNotEmpty(jsonResult)) {
					result = eval('(' + jsonResult + ')');
				}
				$(this).unbind('load');
				$(this).remove();
				AjaxManager.handleResult(result);
				if (!result.success) {
					// TODO see below AjaxManager.alertErrorServer();
				}
				Util.getFunction(callback)(result);
			});
	try {
		formJQ.submit();
	} catch (e) {
		iFrameJQ.unbind('load');
		iFrameJQ.remove();
		console.error(e);
		// TODO see below AjaxManager.alertErrorServer();
		Util.getFunction(callback)({
			'success' : false
		});
	}
};

/**
 * Builds and returns a JQ invisible iFrame
 */
AjaxManager.buildIFrameJQ = function(id) {
	var iFrameJQ = $('<iframe id="' + id + '" name="' + id + '"></iframe>');
	iFrameJQ.css('position', 'absolute');
	iFrameJQ.css('top', '-1000px');
	$('body').append(iFrameJQ);
	return iFrameJQ;
};

AjaxManager.sessionExpired = function() {
	PopupModule.getInstance().show({
		'title' : I18n.get('session.expired'),
		'content' : I18n.get('session.expired.desc')
	});

	setTimeout(function() {
		window.location = NavigationManager.getLogoutURI();
	}, AjaxManager.SESSION_EXPIRATION_LOGIN_URI_REDIRECTION_TIME);
};
