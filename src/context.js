/*jslint plusplus: true */

Tatsu.Context = (function(t) {
	return function(canvas) {
		// private members
		var context,
			element,
			width, height;

		function init(canvas) {
			// canvas is either the id to the canvas element, or the element itself.
			if (typeof canvas === 'string') {
				element = document.getElementById(canvas);
			}
			else {
				element = canvas;
			}

			try {
				context = element.getContext("experimental-webgl");
				width = element.width;
				height = element.height;

				context.viewportWidth = element.width;
				context.viewportHeight = element.height;
			} catch (e) {
			}
		}

		function getWidth() { return width; }
		function getHeight() { return height; }
		function getContext() { return context; }

		// object construction
		init(canvas);
		this.width = getWidth;
		this.height = getHeight;
		this.gl = getContext;
	};
}(Tatsu));