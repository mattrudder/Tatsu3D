
Tatsu.Material = function(ctx, options) {
    // private members
    var _gl = ctx.gl(),
        _self = this,
        _options = options || {},
        _linked = false;

    this.context = ctx;
    this.program = _gl.createProgram();
    this.attributes = [];
    this.uniforms = [];
    this.attributeTypes = {};
    this.attributeLocations = {};
    this.uniformTypes = {};
    this.uniformLocations = {};
    this.boundTextureCount = 0;

    this.bind = function() {
        if (_linked) {
            _gl.useProgram(this.program);
            this.boundTextureCount = 0;
        }
    };

    this.unbind = function() {
        if (_linked) {
            _gl.useProgram(null);
        }
    };

    this.bindScope = function(callback) {
        this.bind();

        if (typeof callback === 'function') {
            callback.apply(this);
        }

        this.unbind();
    }

    function trySetSampler(name, value, type) {
        var glType = _gl[type],
            uniform = this.uniformLocations[name];

        _gl.activeTexture(_gl['TEXTURE' + this.boundTextureCount]); 

        if (value instanceof Tatsu.Texture) {
            _gl.bindTexture(glType, value.texture);
        }
        else {
            _gl.bindTexture(glType, value);
        }
        
        _gl.uniform1i(uniform, this.boundTextureCount);

        this.boundTextureCount++;
    }

    this.bindUniform = function(name, value) {
        var uniformType = this.uniformTypes[name];

        function checkSize(type, expected, actual) {
            if (expected !== actual) {
                console.warn(type + ' expects array with a length of ' + expected + '; got ' + actual + '.');
            }
        }

        if (uniformType) {
            if (this.uniformLocations[name] === undefined) {
                if (this.uniformTypes[name]) {
                    this.uniformLocations[name] = _gl.getUniformLocation(this.program, name);
                }
                else {
                    console.warn('uniform "' + name + '" is undefined!');
                    return;
                }
            }

            switch (uniformType) {
                case 'float':
                    if (typeof value === 'number') {
                        _gl.uniform1f(this.uniformLocations[name], value);
                        
                    }
                    else {
                        checkSize(uniformType, 1, value.length);
                        _gl.uniform1fv(this.uniformLocations[name], value);
                    }
                break;
                case 'int':
                    if (typeof value === 'number') {
                        _gl.uniform1i(this.uniformLocations[name], value);
                        
                    }
                    else {
                        checkSize(uniformType, 1, value.length);
                        _gl.uniform1iv(this.uniformLocations[name], value);
                    }
                break;
                case 'bool':
                    if (typeof value === 'boolean') {
                        _gl.uniform1b(this.uniformLocations[name], value);
                        
                    }
                    else {
                        checkSize(uniformType, 1, value.length);
                        _gl.uniform1bv(this.uniformLocations[name], value);
                    }
                break;
                case 'mat2':
                    checkSize(uniformType, 4, value.length);
                    _gl.uniformMatrix2fv(this.uniformLocations[name], _gl.FALSE, value);
                break;
                case 'mat3':
                    checkSize(uniformType, 9, value.length);
                    _gl.uniformMatrix3fv(this.uniformLocations[name], _gl.FALSE, value);
                break;
                case 'mat4':
                    checkSize(uniformType, 16, value.length);
                    _gl.uniformMatrix4fv(this.uniformLocations[name], _gl.FALSE, value);
                break;
                case 'vec2':
                    checkSize(uniformType, 2, value.length);
                    _gl.uniform2fv(this.uniformLocations[name], value);
                break;
                case 'vec3':
                    checkSize(uniformType, 3, value.length);
                    _gl.uniform3fv(this.uniformLocations[name], value);
                break;
                case 'vec4':
                    checkSize(uniformType, 4, value.length);
                    _gl.uniform4fv(this.uniformLocations[name], value);
                break;
                case 'sampler2D':
                    trySetSampler.apply(_self, [name, value, 'TEXTURE_2D']);
                break;
                case 'samplerCube':
                    trySetSampler.apply(_self, [name, value, 'TEXTURE_CUBE_MAP']);
                break;
                default:
                console.error('uniform type "' + uniformType + '" not supported!');
                break;
            }
        }
    }

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

    // Lookup attributes and uniforms in source by searching directly in the shader.
    // http://altdevblogaday.com/2011/04/18/mike_acton-pokes-around-webgl-and-jquery/
    function lookupAttributes(src) {
        var attributeMatch = /attribute\s+(\w+)\s+(\w+)\s*;/g,
            attributes = src.match(attributeMatch),
            attribute = null,
            attributeType = null,
            attributeName = null;

        for (var i = attributes.length - 1; i >= 0; i--) {
            attribute = attributes[i].split(attributeMatch);
            attributeType = attribute[1];
            attributeName = attribute[2];

            this.attributes.push(attributeName);
            this.attributeTypes[attributeName] = attributeType;
        };
    }

    function lookupUniforms(src) {
        var uniformMatch = /uniform\s+(\w+)\s+(\w+)\s*;/g,
            uniforms = src.match(uniformMatch),
            uniform = null,
            uniformType = null,
            uniformName = null;

        if (uniforms !== null) {
            for (var i = uniforms.length - 1; i >= 0; i--) {
                uniform = uniforms[i].split(uniformMatch);
                uniformType = uniform[1];
                uniformName = uniform[2];

                this.uniforms.push(uniformName);
                this.uniformTypes[uniformName] = uniformType;
            };
        }
    }

    function tryLink() {
        var name, item;

        _gl.linkProgram(this.program);

        if (!_gl.getProgramParameter(this.program, _gl.LINK_STATUS)) {
            return;
        }

        _linked = true;

        // Lookup uniform and attribute locations, now that linking has succeeded.
        for (name in this.uniforms) {
            item = this.uniforms[name];
            this.uniformLocations[item] = _gl.getUniformLocation(this.program, item);
        }
        for (name in this.attributes) {
            item = this.attributes[name];
            this.attributeLocations[item] = _gl.getAttribLocation(this.program, item);
        }
    }
    
    function addShader(src, type) {
        _gl.attachShader(this.program, createShader(_gl, src, type));
        tryLink.apply(this);

        lookupUniforms.apply(this, [src]);
        if (type === _gl.VERTEX_SHADER) {
            lookupAttributes.apply(this, [src]);
        }
    }

    // object construction
    if (options.vertex) {
        addShader(options.vertex, _gl.VERTEX_SHADER);
    }
    else if (options.vertexUrl) {
        $.get(options.vertexUrl, function (data, status, xhr) {
            addShader.apply(_self, [xhr.responseText, _gl.VERTEX_SHADER]);
        });
    }

    if (options.fragment) {
        addShader(options.fragment, _gl.FRAGMENT_SHADER);
    }
    else if (options.fragmentUrl) {
        $.get(options.fragmentUrl, function (data, status, xhr) {
            addShader.apply(_self, [xhr.responseText, _gl.FRAGMENT_SHADER]);
        });
    }

    tryLink.apply(this);
};