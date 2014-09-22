/**
 * Class singleton Popup Module.
 * 
 * @author Maxime Ollagnier
 * 
 * Needs : Twitter Bootstrap JS
 * 
 * Usage :
 * 
 * PopupModule.getInstance().setTitle('myTitle');
 * PopupModule.getInstance().setContent('myContent');
 * PopupModule.getInstance().addButton('OK', function() {...});
 * PopupModule.getInstance().addButton('Cancel');
 * PopupModule.getInstance().show();
 * 
 * or :
 * 
 * PopupModule.getInstance().show({
 * 		'title' : 'myTitle',
 * 		'content' : 'myContent',
 * 		'button0' : {
 * 			'text' : 'OK',
 * 			'callback' : function() {...}
 * 		},
 * 		'button1' : {
 * 			'text' : 'Cancel'
 * 		}
 * });
 */

PopupModule.inherits(Module);
function PopupModule() {
	if (PopupModule.initialized) {
		console.warn('PopupModule should be used as singleton : PopupModule.getInstance()....');
	}
	else {
		var jQ = this.getJQ();
		jQ.addClass("modal").addClass("hide");
		jQ.append($(
				'<div class="modal-header">' +
					'<button class="close" data-dismiss="modal">&times;</button>' +
					'<h3 class="modal-title"></h3>' +
				'</div>'
			));
		jQ.append($('<div class="modal-body"></div>'));
		jQ.append($('<div class="modal-footer"></div>'));
		$('body').append(jQ);
		PopupModule.initialized = true;
	}
}

PopupModule.initialized = false;

PopupModule.prototype.clear = function() {
	this.clearTitle();
	this.clearContent();
	this.clearButtons();
};

PopupModule.prototype.show = function(params) {
	this.set(params);
	this.getJQ().modal('show');
	this.center();
};

PopupModule.prototype.hide = function() {
	this.getJQ().modal('hide');
};

PopupModule.prototype.clearTitle = function() {
	this.getJQ().find(".modal-title").empty();
};

PopupModule.prototype.setTitle = function(jQElement) {
	this.clearTitle();
	this.getJQ().find(".modal-title").append(jQElement);
};

PopupModule.prototype.clearContent = function() {
	this.getJQ().find(".modal-body").empty();
};

PopupModule.prototype.setContent = function(jQElement) {
	this.clearContent();
	this.getJQ().find(".modal-body").append(jQElement);
};

PopupModule.prototype.getContent = function() {
	return this.getJQ().find(".modal-body");
};

PopupModule.prototype.getFooter = function() {
	return this.getJQ().find(".modal-footer");
};

PopupModule.prototype.clearButtons = function() {
	this.getJQ().find(".modal-button").empty();
	this.getJQ().find(".modal-button").remove();
};

PopupModule.prototype.addButton = function(text, callback, dismiss) {
	var that = this;
	var jQButton = $('<button class="btn modal-button"></button>');
	jQButton.append(text);
	jQButton.click(function() {
		if (dismiss !== false && dismiss !== 'false') {
			that.hide();
		}
		Util.getFunction(callback)();
	});
	this.getJQ().find(".modal-footer").append(jQButton);
};

PopupModule.prototype.set = function(params) {
	if (!Util.checkObject(params)) {
		return;
	}
	if (Util.check(params.title)) {
		this.setTitle(params.title);
	}
	if (Util.check(params.content)) {
		this.setContent(params.content);
	}
	if (Util.check(params['button0'])) {
		this.clearButtons();
	}
	var buttonIndex = 0;
	while (Util.check(params['button' + buttonIndex])) {
		this.addButton(params['button' + buttonIndex].text, params['button' + buttonIndex].callback);
		buttonIndex++;
	}
};

PopupModule.prototype.center = function() {
	var jQ = this.getJQ();
	var width = parseInt(jQ.css('width'));
	var left = parseInt(jQ.css('left'));
	var marginLeft = Math.min(width/2, left);
	this.getJQ().css('margin-left', (-marginLeft) + 'px');
};