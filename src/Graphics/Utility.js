
Tatsu.Graphics = Tatsu.Graphics || { };

(function () {
	Tatsu.Graphics.lookupAttributes = function(src) {
		var attributeMatch = /attribute\s+(\w+)\s+(\w+)\s*;/g,
			attributes = src.match(attributeMatch),
			attribute = null,
			attributeType = null,
			attributeName = null,
			attributeList = [],
			attributeTypes = { };

		for (var i = attributes.length - 1; i >= 0; i--) {
			attribute = attributes[i].split(attributeMatch);
			attributeType = attribute[1];
			attributeName = attribute[2];

			attributeList.push(attributeName);
			attributeTypes[attributeName] = attributeType;
		};

		return { names: attributeList, types: attributeTypes };
	};

	Tatsu.Graphics.lookupUniforms = function(src) {
		var uniformMatch = /uniform\s+(\w+)\s+(\w+)\s*;/g,
			uniforms = src.match(uniformMatch),
			uniform = null,
			uniformType = null,
			uniformName = null,
			uniformNames = [],
			uniformTypes = {};

		if (uniforms !== null) {
			for (var i = uniforms.length - 1; i >= 0; i--) {
				uniform = uniforms[i].split(uniformMatch);
				uniformType = uniform[1];
				uniformName = uniform[2];

				uniformNames.push(uniformName);
				uniformTypes[uniformName] = uniformType;
			};
		}

		return { names: uniformNames, types: uniformTypes };
	};

	Tatsu.Graphics.getComponentCount = function(glType) {
		switch (glType) {
			case 'float':
			case 'int':
			case 'bool':
				return 1;
			case 'vec2':
				return 2;
			case 'vec3':
				return 3;
			case 'vec4':
			case 'mat2':
				return 4;
			case 'mat3':
				return 9;
			case 'mat4':
				return 16;
			default:
				console.error('type "' + glType + '" not supported!');
				break;
		}
	};

	Tatsu.Graphics.toGLArray = function(gl, type, source) {
		if (type === 'float') {
			return new Float32Array(source);
		}
		else if (type === 'uint16') {
			return new Uint16Array(source);
		}
		else if (type === 'uint32') {
			return new Uint32Array(source);
		}
		else if (type === 'uint8') {
			return new Uint8Array(source);
		}
	};

	Tatsu.Graphics.toGLType = function(gl, type) {
		if (type === 'float') {
			return gl.FLOAT;
		}
		else if (type === 'uint16') {
			return gl.UNSIGNED_SHORT;
		}
		else if (type === 'uint32') {
			return gl.UNSIGNED_INT;
		}
		else if (type === 'uint8') {
			return gl.UNSIGNED_BYTE;
		}
	};
}());
