/**
 * Class singleton BackButton Module.
 * 
 * @author Maxime Ollagnier
 */

BackButtonModule.inherits(Module);
function BackButtonModule() {
	this.jQ = $('#page > #backButton');
}

BackButtonModule.prototype.fillJQ = function(jQ) {
	jQ.append($('<div class="btn backButton"><i class="icon-chevron-left icon"/>' + I18n.get('page.back.button') + '</div>'));
	jQ.click(function() {
		NavigationManager.back();
	});
	return jQ;
};
