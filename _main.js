/**
 * Main initialization function
 */
$(document).ready(function() {

	EnumManager.init(function() {
		UserManager.init(function() {
			MenuMainModule.getInstance().buildJQ();
		    MenuUserModule.getInstance().buildJQ();
		    BackButtonModule.getInstance().buildJQ();
		    FooterModule.getInstance().buildJQ();
		    
		    LoadingModule.getInstance().hide();
		    
		    NavigationManager.init();
		});
	});
});