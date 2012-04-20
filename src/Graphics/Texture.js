
Tatsu.Texture = (function() {
    var s_textureCount = 0;

    return function(ctx, options) {
        // private members
        var _ctx = ctx,
            _gl = ctx.gl(),
            _self = this,
            _id = s_textureCount++,
            _options = options || {},
            _imageType = _options.type || 'TEXTURE_2D',
            _textureType = _gl[_imageType],
            _imagesToLoad = 0,
            _width = 0,
            _height = 0,
            _loaded = false,
            _texture = _gl.createTexture();

        this.id = function() {
            return _id;
        };

        this.texture = function() {
            return _texture;
        };

        this.type = function() {
            return _textureType;
        };
        
        this.isLoaded = function() {
            return _loaded;
        };
        
        this.width = function() { 
            return _width;
        };
        
        this.height = function() {
            return _height;
        };

        this.bind = function() {
        	_gl.bindTexture(_textureType, _texture);
        };

        this.unbind = function() {
        	_gl.bindTexture(_textureType, null);
        };

        this.bindScope = function(callback) {
            _self.bind();

            if (typeof callback === 'function') {
                callback.apply(_self);
            }

            _self.unbind();
        }

        function onImageLoaded(image, type) {
    	    _width = image.width;
    	    _height = image.height;

        	_gl.bindTexture(_textureType, _texture);

        	// TODO: Support glPixelStore properly via options
        	_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, false);

        	// TODO: Support glTexParameter properly via options
        	_gl.texParameteri(_textureType, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
        	_gl.texParameteri(_textureType, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
        	_gl.texParameteri(_textureType, _gl.TEXTURE_WRAP_S, _gl.REPEAT);
        	_gl.texParameteri(_textureType, _gl.TEXTURE_WRAP_T, _gl.REPEAT);

        	_gl.texImage2D(_gl[type], 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, image);

        	_gl.bindTexture(_textureType, null);

        	_imagesToLoad--;
        	if (_imagesToLoad === 0) {
                _loaded = true;
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
        	loadImage.apply(_self, [_options.textureUrl, _imageType]);
        }
        else {
    		_imagesToLoad = _options.textureUrl.length;
    		for (var i = 0; i < _imagesToLoad; ++i) {
    			loadImage.apply(_self, [_options.textureUrl[i], _options.imageType[i]]);
    		}
        }
    };
}());