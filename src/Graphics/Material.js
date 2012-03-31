
Tatsu.Material = function(ctx, options) {
    // private members
    var _gl = ctx.gl(),
        _program,
        _attributes = {},
        _uniforms = {},
        _options = options || {};

    function createShader(_gl, script, type) {
        var shader = _gl.createShader(type);
        _gl.shaderSource(shader, script);
        _gl.compileShader(shader);
            
        if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
            console.log(_gl.getShaderInfoLog(shader));
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

    
    // object construction
    _program = _gl.createProgram();
    if (options.vertex) {
        _gl.attachShader(_program, createShader(_gl, options.vertex, _gl.VERTEX_SHADER));
    }
    if (options.fragment) {
        _gl.attachShader(_program, createShader(_gl, options.fragment, _gl.FRAGMENT_SHADER));
    }

    _gl.linkProgram(_program);
    
    if (!_gl.getProgramParameter(_program, _gl.LINK_STATUS)) {
        console.error("Error creating material: \n" + "validation: " + _gl.getProgramParameter(_program, _gl.VALIDATE_STATUS) + ", error [" + _gl.getError() + "]");
        return;
    }

    // cache attribute and uniform locations.
    lookupAttributes(options._attributes);
    lookupUniforms(options._uniforms);
    
    this.context = ctx;
    this.program = _program;
    this.attributes = _attributes;
    this.uniforms = _uniforms;
};