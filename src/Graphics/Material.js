
Tatsu.Material = function(ctx, options) {
    // private members
    var _gl = ctx.gl(),
        _program,
        _attributes = {},
        _uniforms = {},
        _options = options || {},
        _isLinked = false;

    function createShader(_gl, script, type) {
        var shader = _gl.createShader(type);
        _gl.shaderSource(shader, script);
        _gl.compileShader(shader);
            
        if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
            console.error(_gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function lookupAttributes(list) {
        var attr;

        for (var name in list) {
            attr = list[name];
            _attributes[name] = _gl.getAttribLocation(_program, name);
        }
    }

    function lookupUniforms(list) {
        var uniform;

        for (var name in list) {
            uniform = list[name];
            _uniforms[name] = _gl.getUniformLocation(_program, name);
        }
    }

    function tryLink() {
        _gl.linkProgram(_program);

        if (!_gl.getProgramParameter(_program, _gl.LINK_STATUS)) {
            return;
        }

        // cache attribute and uniform locations.
        _isLinked = true;
        lookupAttributes.apply(this, [_options.attributes]);
        lookupUniforms.apply(this, [_options.uniforms]);
    }
    
    function addShader(src, type) {
        _gl.attachShader(_program, createShader(_gl, src, type));
        tryLink();
    }

    // object construction
    _program = _gl.createProgram();
    if (options.vertex) {
        addShader(options.vertex, _gl.VERTEX_SHADER);
    }
    else if (options.vertexUrl) {
        $.get(options.vertexUrl, function (data, status, xhr) {
            addShader.apply(this, [xhr.responseText, _gl.VERTEX_SHADER]);
        });
    }

    if (options.fragment) {
        addShader(options.fragment, _gl.FRAGMENT_SHADER);
    }
    else if (options.fragmentUrl) {
        $.get(options.fragmentUrl, function (data, status, xhr) {
            addShader.apply(this, [xhr.responseText, _gl.FRAGMENT_SHADER]);
        });
    }

    tryLink.apply(this);
    
    this.context = ctx;
    this.program = _program;
    this.attributes = _attributes;
    this.uniforms = _uniforms;
};