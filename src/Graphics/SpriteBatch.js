
Tatsu.SpriteBatch = function(ctx, options) {
    // private members
    var _ctx = ctx,
    	_gl = ctx.gl(),
        _self = this,
        _options = options || {},
        _streamBufferNames = ['position', 'texcoord', 'color'],
	    _streamBuffers = [], // position, texcoord, color
	    _streamBufferStrides = [3, 2, 4],
	    _attributes = {},
	    _drawList = [],
	    _vsSource,
	    _fsSource,
	    _maxBatchSize = 512,
	    _verticesPerSprite = 4,
	    _indiciesPerSprite = 6,
	    _vertexSize = 9 * 4,
	    _vbSize = 0,
	    _defaultMaterial = null,
	    _matTmp = mat4.create(),
	    _vecTmp = vec3.create(),
		_defaultVertices = [
			0, 0,
			1, 0,
			0, 1,
			1, 1
		],
		_defaultTexcoords = [
			0, 0,
			1, 0,
			0, 1,
			1, 1
		],
		_defaultColor = [1, 1, 1, 1];

	function renderSprite(sprite, spriteIndex, batchIndex) {
		var index = 0,
			offset = 0,
			position = null,
			texcoord = null,
			positions = _streamBuffers[0],
			texcoords = _streamBuffers[1],
			colors = _streamBuffers[2],
			positionStride = _streamBufferStrides[0],
			texcoordStride = _streamBufferStrides[1],
			colorStride = _streamBufferStrides[2],
			vertexOffset = batchIndex * _verticesPerSprite,
			color = sprite.color || _defaultColor,
			source = sprite.source,
			destination = sprite.destination,
			rotation = sprite.rotation || 0,
			transform = mat4.rotateZ(mat4.identity(_matTmp), rotation);

		// TODO: Rotation, scale;
		offset = vertexOffset * positionStride;
		for (index = 0; index < _verticesPerSprite; ++index) {
			position = _vecTmp;
			position[0] = (_defaultVertices[index * 2] * destination[2]) + destination[0];
			position[1] = (_defaultVertices[index * 2 + 1] * destination[3]) + destination[1];
			position[2] = 0; // depth?
			mat4.multiplyVec3(transform, position);

			try {
				positions.set(position, offset);
			}
			catch(err) {
				console.error(err + ' offset: ' + offset + ', length: ' + positions.length);
			}

			offset += positionStride;
		}

		offset = vertexOffset * texcoordStride;
		for (index = 0; index < _verticesPerSprite; ++index) {
			texcoord = [(_defaultTexcoords[index * texcoordStride] * source[2]) + source[0], (_defaultTexcoords[index * texcoordStride + 1] * source[3]) + source[1]];

			try {
				texcoords.set(texcoord, offset);
			}
			catch(err) {
				console.error(err + ' offset: ' + offset + ', length: ' + positions.length);
			}
			offset += texcoordStride;
		}

		// vertex color
		offset = vertexOffset * colorStride;
		for (index = 0; index < _verticesPerSprite; ++index) {
			try {
				colors.set(color, offset);
			}
			catch(err) {
				console.error(err + ' offset: ' + offset + ', length: ' + positions.length);
			}
			offset += colorStride;
		}
	}

	function renderBatch(material, texture, startIndex, endIndex) {
		var index,
			size,
			sprite,
			array = null,
			numSprites = endIndex - startIndex,
			attributeName,
			attributeLocation,
			sizeInBytes = 0;

		if (!texture.isLoaded())
			return;

		for (index = startIndex; index < endIndex; ++index) {
			sprite = _drawList[index];
			renderSprite.apply(_self, [sprite, index, index - startIndex]);
		}

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);

		// Copy data to array buffer.
		for (index = 0; index < _streamBuffers.length; ++index) {
			array = _streamBuffers[index];
			_gl.bufferSubData(_gl.ARRAY_BUFFER, sizeInBytes, array);

			// TODO: Custom attribute mapping for custom materials?
			attributeName = _streamBufferNames[index];
			attributeLocation = material.attributeLocations[attributeName];
			_gl.enableVertexAttribArray(attributeLocation);
			_gl.vertexAttribPointer(attributeLocation, _streamBufferStrides[index], _gl.FLOAT, false, 0, sizeInBytes);

			sizeInBytes += numSprites * _verticesPerSprite * _streamBufferStrides[index] * 4;
		}

		material.bindScope(function (){
			var viewport = _gl.getParameter(_gl.VIEWPORT);
			var matProjection = mat4.ortho(0, _ctx.width(), _ctx.height(), 0, 0.001, 100000);
			this.bindUniform('matTransform', matProjection);
			this.bindUniform('spriteSampler', texture);

			_gl.drawElements(_gl.TRIANGLES, (endIndex - startIndex) * _indiciesPerSprite, _gl.UNSIGNED_SHORT, 0);
		});

		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
	}

	function createVertexArrayBuffer() {
		var index = 0, size = 0;

		_vbSize = _maxBatchSize * _verticesPerSprite * _vertexSize;

		// client side buffers for filling vertex buffer.
		for (index = 0; index < _streamBufferStrides.length; ++index) {
			size = _maxBatchSize * _verticesPerSprite * _streamBufferStrides[index];
			array = new Float32Array(size);
			_streamBuffers.push(array);
		}

		_vertexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, _vbSize, _gl.DYNAMIC_DRAW);
		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
	}
	function createElementArrayBuffer() {
		var index = 0,
			indexArray = new Int16Array(_maxBatchSize * _indiciesPerSprite);

		for (var vertex = 0; vertex < _maxBatchSize * _verticesPerSprite; vertex += _verticesPerSprite) {
			indexArray[index++] = vertex;
			indexArray[index++] = vertex + 1;
			indexArray[index++] = vertex + 2;

			indexArray[index++] = vertex + 1;
			indexArray[index++] = vertex + 3;
			indexArray[index++] = vertex + 2;
		}

		_indexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);
		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, indexArray, _gl.STATIC_DRAW);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	}

    this.start = function() {

    };

    this.end = function() {
	    var index = 0,
		    sprite = null,
		    batchTexture = null,
		    batchMaterial = null,
		    batchStart = 0;

		// sort on texture
		fnSort = function(a, b) {
			var cmp = a.texture.id() - b.texture.id();
			return cmp;
		};

		_drawList.sort(fnSort);
    	
	    for (index = 0; index < _drawList.length; ++index) {
		    sprite = _drawList[index];

			if (sprite.texture !== batchTexture || sprite.material !== batchMaterial) {
				if (index > batchStart)
					renderBatch.apply(_self, [batchMaterial, batchTexture, batchStart, index]);

				batchMaterial = sprite.material;
				batchTexture = sprite.texture;
				batchStart = index;
			}
			else if (index - batchStart >= _maxBatchSize) {
				renderBatch.apply(_self, [batchMaterial, batchTexture, batchStart, index]);
				batchStart = index;
			}
	    }

	    // render the final batch.
	    renderBatch.apply(_self, [batchMaterial, batchTexture, batchStart, _drawList.length]);
	    _drawList = [];
    };

    this.draw = function(options) {
        var sprite = {},
        	texWidth = 0,
        	texHeight = 0;

        if (!options.texture) {
        	throw 'Sprite texture required!';
        }

        texWidth = options.texture.width();
        texHeight = options.texture.height();
		sprite.texture = options.texture;
		sprite.material = options.material || _defaultMaterial;

		if (options.destination) {
			if (options.destination.length >= 4) {
				sprite.destination = [options.destination[0], options.destination[1], options.destination[2], options.destination[3]];	
			}
			else if (options.destination.length >= 2 && options.source && options.source.length >= 4) {
				sprite.destination = [options.destination[0], options.destination[1], options.source[2], options.source[3]];	
			}
		}

		if (options.source && options.source.length >= 4) {
			sprite.source = [options.source[0], options.source[1], options.source[2], options.source[3]];
			sprite.destination = sprite.destination || [0, 0, options.source[2], options.source[3]];
		}
		else {
			sprite.source = [0, 0, sprite.texture.width(), sprite.texture.height()];
			sprite.destination = sprite.destination || [0, 0, sprite.texture.width(), sprite.texture.height()];
		}

		if (texWidth != 0) {
			sprite.source[0] /= texWidth;
			sprite.source[2] /= texWidth;
		}

		if (texHeight != 0) {
			sprite.source[1] /= texHeight;
			sprite.source[3] /= texHeight;
		}

		_drawList.push(sprite);
    };

	createVertexArrayBuffer();
	createElementArrayBuffer();

	_vsSource =
		'attribute vec3 position;\n' +
		'attribute vec2 texcoord;\n' +
		'attribute vec4 color;\n' +
		'\n' +
		'uniform mat4 matTransform;\n' +
		'\n' +
		'varying vec2 uv;\n' +
		'varying vec4 vcolor;\n' +
		'\n' +
		'void main(void) {\n' +
		'	gl_Position = matTransform * vec4(position, 1.0);\n' +
		'	uv = texcoord;\n' +
		'	vcolor = color;\n' +
		'}\n';


	_fsSource =
		'precision highp float;\n' +
		'\n' +
		'uniform sampler2D spriteSampler;\n'+
		'\n' +
		'varying vec2 uv;\n'+
		'varying vec4 vcolor;\n'+
		'\n' +
		'void main(void) {\n' +
		'	gl_FragColor = texture2D(spriteSampler, vec2(uv.s, uv.t));\n' +
		'\n' +
		'}\n';

	_attributes = Tatsu.Graphics.lookupAttributes(_vsSource);
	(function (){
		var attributeName,
			attributeType,
			attributeSizes = [];

		for (index = 0; index < _attributes.names.length; ++index) {
			attributeName = _attributes.names[index];
			attributeType = _attributes.types[attributeName];
			attributeSizes[index] = Tatsu.Graphics.getComponentCount(attributeType);
		}

		_attributes.sizes = attributeSizes;
	}());


	_defaultMaterial = new Tatsu.Material(ctx, {
		vertexShader: _vsSource,
		fragmentShader: _fsSource
	})
};