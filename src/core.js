/*jslint plusplus: false, forin: false, noarg: false */

var Tatsu = (function () {

	function getScriptFromElement(el) {
		var scriptElement = typeof el === 'string' ? document.getElementById(el) : el,
			str = '',
			k;

		if (!scriptElement) {
			return '';
		}
		
		k = scriptElement.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}
		
		return str;
	}

	// public interface
	return {
		scriptFromElement: getScriptFromElement
	};
}());
