
Tatsu.SpriteBatch = function(ctx, options) {
    // private members
    var _gl = ctx.gl(),
        _self = this,
        _options = options || {},
	    _streamBuffers = [], // position, texcoord, color
		_streamBufferOffsets = [],
	    _streamBufferStrides = [4, 2, 4],
	    _attributes = {},
	    _drawList = [],
        _drawOptions = {},
	    _vsSource = '',
	    _fsSource = '',
	    _defaultVerts = null,
	    _defaultMaterial = null;

	function renderSprite(sprite) {

	}

	function renderBatch(material, texture, startIndex, endIndex) {
		var index,
			sprite;

		_streamBuffers.length = 0;
		_streamBufferOffsets.length = 0;

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);

		material.bindScope(function (){
			this.bindUniform('spriteSampler', texture);

			for (index = startIndex; index < endIndex; ++index) {
				sprite = _drawList[index];

				renderSprite.apply(_self, sprite);



				// TODO: Draw vertex buffer
			}
		});

		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
	}

    this.start = function() {

    };

    this.end = function() {
	    var i = 0,
		    attributeName,
		    attributeType,
		    sprite = null,
		    batchTexture = null,
		    batchMaterial = null,
		    batchStart = 0;

    	// TODO: Sort sprites.
	    for (i = 0; i < _drawList.length; i++) {
		    sprite = _drawList[i];

			if (sprite.texture != batchTexture || sprite.material != batchMaterial) {
				if (i > batchStart)
					renderBatch.apply(_self, batchMaterial, batchTexture, batchStart, i);

				batchMaterial = sprite.material;
				batchTexture = sprite.texture;
				batchStart = i;
			}
	    }

	    for (i = 0; i < _attributes.names.length; ++i) {

		    _gl.vertexAttribPointer(attribute, streamStride, streamType, false, 0, streamOffset);
		    _gl.enableVertexAttribArray(attribute);
	    }
    };

    this.draw = function(opt) {
        var options = {},
	        sprite = {};
        options = $.extend(_drawOptions, opt);

        if (!Tatsu.getType(options.texure) === 'Tatsu.Texture')
            throw 'Sprite texture required.';

	    sprite.texture = options.texture;
	    sprite.material = options.material || _defaultMaterial;

	    if (Tatsu.getType(options.sourceRect) === 'Array' && options.sourceRect.length === 4) {
	        sprite.sourceRect = options.sourceRect;
        }
        else {
	        sprite.sourceRect = [0, 0, texture.width, texture.height];
        }

	    _drawList.push(sprite);
    };

    _drawOptions.texture = undefined;

	_vertexBuffer = _gl.createBuffer();
	_indexBuffer = _gl.createBuffer();

	_defaultVerts = new Float32Array([
		0, 0,
		1, 0,
		0, 1,
		1, 1
	]);

	_vsSource =
		'attribute vec4 position;' +
		'attribute vec2 texcoord;' +
		'attribute vec4 color;' +
		'' +
		'uniform mat4 matTransform;' +
		'' +
		'varying vec2 uv;' +
		'' +
		'void main(void) {' +
		'	gl_Position = position * matTransform;' +
		'}';


	_fsSource =
		'precision mediump float;' +
		'' +
		'uniform sampler2D spriteSampler;'+
		'uniform vec4 color;'+
		'' +
		'varying vec2 uv;'+
		'' +
		'void main(void) {' +
		'	gl_FragColor = texture2D(spriteSampler, uv) * color;' +
		'' +
		'}';

	_attributes = Tatsu.Graphics.lookupAttributes(_vsSource);
	(function (){
		var attributeName,
			attributeType,
			attributeSizes = [];

		for (i = 0; i < _attributes.names.length; ++i) {
			attributeName = _attributes.names[i];
			attributeType = _attributes.types[attributeName];
			attributeSizes[i] = Tatsu.Graphics.getComponentCount(attributeType);
			_attributes.types[attributeName] = Tatsu.Graphics.toGLType(_gl, attributeType);
		}

		_attributes.sizes = attributeSizes;
	}());


	_defaultMaterial = new Tatsu.Material({
		vertexShader: _vsSource,
		fragmentShader: _fsSource
	})
};