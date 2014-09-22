/**
 * Class singleton Loading Module.
 * 
 * @author Maxime Ollagnier
 * 
 * Usage :
 * 
 * LoadingModule.getInstance().show();
 * LoadingModule.getInstance().hide();
 */

LoadingModule.inherits(Module);
function LoadingModule(id, title) {
	this.jQ = $('#loading');
}

LoadingModule.prototype.hide = function() {
	this.getJQ().children('#loading-image').hide();
};

LoadingModule.prototype.show = function() {
	this.getJQ().children('#loading-image').show();
};
