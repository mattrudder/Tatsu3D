/*jslint plusplus: true */

Tatsu.Material = (function(t) {
	return function(ctx, options) {
		// private members
		var context, 
			shaders = {},
			shaderProgram;
//		var context,
//			element,
//			width, height;

		function createShader(gl, script, type) {
			var shader = gl.createShader(type);
			gl.shaderSource(shader, script);
			gl.compileShader(shader);
				
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}

			return shader;
		}

		function init(ctx, options) {
			var gl = ctx.gl();

			context = ctx;
			shaderProgram = gl.createProgram();

			if (options.vertex) {
				shaders.vertex = createShader(gl, options.vertex, gl.VERTEX_SHADER);
			}
			if (options.fragment) {
				shaders.fragment = createShader(gl, options.fragment, gl.FRAGMENT_SHADER);	
			}

			if (shaders.vertex) {
				gl.attachShader(shaderProgram, shaders.vertex);
			}
			if (shaders.fragment) {
				gl.attachShader(shaderProgram, shaders.fragment);
			}

			gl.linkProgram(shaderProgram);
			
			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
				alert("Could not init shaders!");
			}
			
			//gl.useProgram(shaderProgram);
			
			//shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
			//gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			//shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
			//shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
			//console.log(options);
		}


		// object construction
		init(ctx, options);
	};
}(Tatsu));