
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
	    _maxBatchSize = 2048,
	    _verticesPerSprite = 4,
	    _indiciesPerSprite = 6,
	    _vertexSize = 10,
	    _defaultMaterial = null,
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

	function renderSprite(sprite, index) {
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
			vertexOffset = index * _verticesPerSprite,
			color = sprite.color || _defaultColor,
			origin = sprite.origin || [0.5, 0.5, 1, 1],
			destination = sprite.destination || [0, 0, 1, 1],
			rotation = sprite.rotation || 0,
			transform = mat4.rotateZ(mat4.identity(mat4.create()), rotation);

		// TODO: Rotation, scale;
		offset = vertexOffset * positionStride;
		for (index = 0; index < _verticesPerSprite; ++index) {
			position = vec3.create([
				(_defaultVertices[index * 2] - origin[0]) * destination[2],
				(_defaultVertices[index * 2 + 1] - origin[1]) * destination[3],
				0]); // depth?
			mat4.multiplyVec3(transform, position);

			positions.set(position, offset);
			offset += positionStride;
		}

		offset = vertexOffset * texcoordStride;
		for (index = 0; index < _verticesPerSprite; ++index) {
			texcoord = [_defaultTexcoords[offset], _defaultTexcoords[offset + 1]];
			texcoords.set(texcoord, offset);
			offset += texcoordStride;
		}

		// vertex color
		offset = vertexOffset * colorStride;
		for (index = 0; index < _verticesPerSprite; ++index) {
			colors.set(color, vertexOffset * colorStride);
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

		if (!texture.isLoaded)
			return;

		_streamBuffers.length = 0;

		// positions, texcoords, colors
		for (index = 0; index < _streamBufferStrides.length; ++index) {
			size = numSprites * _verticesPerSprite * _streamBufferStrides[index];
			_streamBuffers.push(new Float32Array(size));
		}

		for (index = startIndex; index < endIndex; ++index) {
			sprite = _drawList[index];
			renderSprite.apply(_self, [sprite, index - startIndex]);
		}

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);

		// Copy data to array buffer.
		var names 
		for (index = 0; index < _streamBuffers.length; ++index) {
			array = _streamBuffers[index];
			_gl.bufferSubData(_gl.ARRAY_BUFFER, sizeInBytes, array);

			// TODO: Custom attribute mapping for custom materials?
			attributeName = _streamBufferNames[index];
			attributeLocation = material.attributeLocations[attributeName];
			_gl.vertexAttribPointer(attributeLocation, _streamBufferStrides[index], _gl.FLOAT, false, 0, sizeInBytes);
			_gl.enableVertexAttribArray(attributeLocation);

			sizeInBytes += array.byteLength;
		}

		material.bindScope(function (){
			var xScale = 2 / _ctx.width();
			var yScale = 2 / _ctx.height();
			var matTransform = mat4.create([
				xScale, 0, 0, _ctx.width(),
				0, yScale, 0, _ctx.height(),
				0, 0, -2/100, -100,
				0, 0, 0, 1]);
		//	matTransform = mat4.ortho(0, _ctx.width(), _ctx.height(), 0, 0.1, 1000)
			var matTransform = mat4.identity(mat4.create());

			this.bindUniform('matTransform', matTransform);
			this.bindUniform('spriteSampler', texture);

			_gl.drawElements(_gl.TRIANGLES, (endIndex - startIndex) * _indiciesPerSprite, _gl.UNSIGNED_SHORT, 0);
		});

		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
	}

	function createVertexArrayBuffer() {
		_vertexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, _maxBatchSize * _verticesPerSprite * _vertexSize, _gl.STATIC_DRAW);
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

    	// TODO: Sort sprites.
	    for (index = 0; index < _drawList.length; index++) {
		    sprite = _drawList[index];

			if (sprite.texture != batchTexture || sprite.material != batchMaterial) {
				if (index > batchStart)
					renderBatch.apply(_self, [batchMaterial, batchTexture, batchStart, index]);

				batchMaterial = sprite.material;
				batchTexture = sprite.texture;
				batchStart = index;
			}
			else if (index - batchStart > _maxBatchSize) {
				renderBatch.apply(_self, [batchMaterial, batchTexture, batchStart, index]);
				batchStart = index;
			}

	    }

	    // render the final batch.
	    renderBatch.apply(_self, [batchMaterial, batchTexture, batchStart, _drawList.length]);
	    _drawList = [];
    };

    this.draw = function(options) {
        var sprite = {};

//        if (!Tatsu.getType(options.texure) === 'Tatsu.Texture')
//            throw 'Sprite texture required.';

	    sprite.texture = options.texture;
	    sprite.material = options.material || _defaultMaterial;

//	    if (Tatsu.getType(options.destination) === 'Array' && options.sourceRect.length === 3) {
//		    sprite.destination = vec3.create(options.destination);
//	    }
//	    else if (Tatsu.getType(options.destination) === 'vec3') {
//		    sprite.destination = options.destination;
//	    }
//	    else {
//		    sprite.destination = vec3.create();
//	    }
//
//	    if (Tatsu.getType(options.sourceRect) === 'Array' && options.sourceRect.length === 4) {
//	        sprite.sourceRect = options.sourceRect;
//        }
//        else {
//	        sprite.sourceRect = [0, 0, texture.width, texture.height];
//        }

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
		'	gl_Position = vec4(position, 0) * matTransform;\n' +
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
		'	gl_FragColor = texture2D(spriteSampler, uv);\n' +
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