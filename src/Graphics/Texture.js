
Tatsu.Texture = function(ctx, options) {
    // private members
    var _gl = ctx.gl(),
        _self = this,
        _options = options || {},
        _imageType = _options.type || 'TEXTURE_2D',
        _textureType = _gl[_imageType],
        _imagesToLoad = 0;

    this.context = ctx;
    this.texture = _gl.createTexture();
    this.type = _textureType;
	this.width = 0;
	this.height = 0;
    this.isLoaded = false;

    this.bind = function() {
    	_gl.bindTexture(_textureType, this.texture);
    };

    this.unbind = function() {
    	_gl.bindTexture(_textureType, null);
    };

    this.bindScope = function(callback) {
        this.bind();

        if (typeof callback === 'function') {
            callback.apply(this);
        }

        this.unbind();
    }

    function onImageLoaded(image, type) {
	    this.width = image.width;
	    this.height = image.height;

    	_gl.bindTexture(_textureType, this.texture);

    	// TODO: Support glPixelStore properly via options
    	_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);

    	// TODO: Support glTexParameter properly via options
    	_gl.texParameteri(_textureType, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
    	_gl.texParameteri(_textureType, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
    	_gl.texParameteri(_textureType, _gl.TEXTURE_WRAP_S, _gl.REPEAT);
    	_gl.texParameteri(_textureType, _gl.TEXTURE_WRAP_T, _gl.REPEAT);

    	_gl.texImage2D(_gl[type], 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, image);

    	_gl.bindTexture(_textureType, null);

    	_imagesToLoad--;
    	if (_imagesToLoad === 0) {
            this.isLoaded = true;
            if (typeof _options.callback === 'function') {
                _options.callback.apply(_self);
            }
        }
    }

    function loadImage(url, type) {
    	var image = new Image();
    	image.onload = function () {
    		onImageLoaded.apply(_self, [image, type])
    	};
    	image.src = url;
    }

    // object construction
    if (typeof _options.textureUrl === 'string') {
    	_imagesToLoad = 1;
    	loadImage(_options.textureUrl, _imageType);
    }
    else {
		_imagesToLoad = _options.textureUrl.length;
		for (var i = 0; i < _imagesToLoad; ++i) {
			loadImage(_options.textureUrl[i], _options.imageType[i]);
		}
    }
};