/**
 * Class singleton Footer Module.
 * 
 * @author Maxime Ollagnier
 */

FooterModule.inherits(Module);
function FooterModule() {
	this.jQ = $('#page > #footer');
}

/** Application development year */
FooterModule.DEV_YEAR = 2011;

FooterModule.prototype.fillJQ = function(jQ) {
	var separator = '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;';
	var jQFooterLabel = $('<div id="footerLabel"></div>');
	jQFooterLabel.append($('<a href="mailto:Sepalia.dev@docapost-bpo.com">' + I18n.get('footer.contact') + '</a>'));
	jQFooterLabel.append(separator);
	jQFooterLabel.append($('<a href="#LegalNoticePage">' + I18n.get('footer.legal.notice') + '</a>'));
	jQFooterLabel.append(separator);
	jQFooterLabel.append('&copy; Docapost BPO - ' + this.getRightsPeriod() + ' - ' + I18n.get('footer.copyright'));
	jQ.append(jQFooterLabel);
	return jQ;
};

FooterModule.prototype.getRightsPeriod = function() {
	var currentYear = new Date().getFullYear();
	if (FooterModule.DEV_YEAR < currentYear) {
		return FooterModule.DEV_YEAR + ' / ' + currentYear;
	}
	return FooterModule.DEV_YEAR.toString();
};
