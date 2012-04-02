
Tatsu.Renderer = function(options) {
    // private members
    var _gl,
        _domElement,
        _width,
        _height,
        _options = options || {};

    _options.clearColor = _options.clearColor || [0, 0, 0, 1];
    
    _domElement = _options.element === undefined ? document.createElement('canvas') : 
        typeof _options.element === 'string' ? document.getElementById(_options.element) :
        null;

    try {
        _gl = _domElement.getContext('webgl') || _domElement.getContext('experimental-webgl');

        // If webgl-debug.js is in use, wrap our context in that.
        if (typeof WebGLDebugUtils === 'object' && typeof WebGLDebugUtils.makeDebugContext === 'function') {
            _gl = WebGLDebugUtils.makeDebugContext(_gl);
            // _gl = WebGLDebugUtils.makeDebugContext(_gl, function (err, funcName, args) {
            //     console.error(WebGLDebugUtils.glEnumToString(err) + ' was caused by call to ' + funcName);
            // });
        }

        _width = _domElement.width;
        _height = _domElement.height;

        _gl.viewportWidth = _width;
        _gl.viewportHeight = _height;

        _gl.clearColor(_options.clearColor[0], _options.clearColor[1], _options.clearColor[2], _options.clearColor[3]);
        _gl.enable(_gl.DEPTH_TEST);
        _gl.viewport(0, 0, _width, _height);
    } catch (e) {
    }

    this.gl = function() { return _gl; };
    this.width = function(w) {
        if (w) {
            _width = w;
            _gl.viewportWidth = w;
            _domElement.style.width = w; 

            return w;
        }
        else {
            return _width;
        }
    };
    this.height = function(h) {
        if (h) {
            _height = h;
            _gl.viewportHeight = h;
            _domElement.style.height = h; 

            return h;
        }
        else {
            return _height;
        }
    };
    this.clear = function() {
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
    };
};