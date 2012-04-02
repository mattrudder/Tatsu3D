
Tatsu.Model = function(ctx, options) {
    var _gl = ctx.gl(),
        _self = this,
        _options = options || {};

    this.streamNames = [];
    this.streamBuffers = [];
    this.streamBufferOffsets = {};
    this.streamBufferStrides = {};
    this.streamBufferTypes = {};
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.indexStreamBuffer = null;
    this.indexStreamType = null;
    this.vertexCount = 0;
    this.indexCount = 0;

    this.bind = function(material) {
        var attributes = material.attributeLocations,
            attribute = null,
            streamName = null,
            streamOffset = 0,
            streamStride = 0,
            streamType = 0;

        _gl.bindBuffer(_gl.ARRAY_BUFFER, this.vertexBuffer);

        for (var i = 0; i < this.streamNames.length; i++) {
            streamName = this.streamNames[i];
            attribute = attributes[streamName];
            streamOffset = this.streamBufferOffsets[streamName];
            streamStride = this.streamBufferStrides[streamName];
            streamType = this.streamBufferTypes[streamName];

            _gl.vertexAttribPointer(attribute, streamStride, streamType, false, 0, streamOffset);
            _gl.enableVertexAttribArray(attribute);
        }

        if (this.indexBuffer) {
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        }
    };

    this.draw = function() {
        if (this.indexBuffer === null) {
            _gl.drawArrays(_gl.TRIANGLES, 0, this.vertexCount);
        }
        else {
            _gl.drawElements(_gl.TRIANGLES, this.indexCount, this.indexStreamType, 0);
        }
    };

    function loadModel(source) {
        var i = 0,
            streamCount = 0,
            bufferSize = 0,
            stream = null,
            streamName = null,
            streamBuffer = null;

        for (streamName in source.streams) {
            stream = source.streams[streamName];

            streamBuffer = Tatsu.Types.toGLArray(_gl, stream.type, stream.data);

            this.streamNames[i] = streamName;
            this.streamBuffers[i] = streamBuffer;
            this.streamBufferOffsets[streamName] = bufferSize;
            this.streamBufferStrides[streamName] = stream.stride;
            this.streamBufferTypes[streamName] = Tatsu.Types.toGLType(_gl, stream.type);
            this.vertexCount = stream.data.length / stream.stride;            

            if (streamBuffer) {
                bufferSize += streamBuffer.byteLength;
            }

            ++i;
        }

        streamCount = i;
        this.vertexBuffer = _gl.createBuffer();

        _gl.bindBuffer(_gl.ARRAY_BUFFER, this.vertexBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, bufferSize, _gl.STATIC_DRAW);

        i = 0;
        for (streamName in source.streams) {
            stream = source.streams[streamName];

            _gl.bufferSubData(_gl.ARRAY_BUFFER, this.streamBufferOffsets[streamName], this.streamBuffers[i]);

            ++i;
        }

        if (source.faces) {
            this.indexBuffer = _gl.createBuffer();
            this.indexStreamBuffer = Tatsu.Types.toGLArray(_gl, source.faces.type, source.faces.data);
            this.indexStreamType = Tatsu.Types.toGLType(_gl, source.faces.type);
            this.indexCount = source.faces.data.length;

            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, this.indexStreamBuffer, _gl.STATIC_DRAW);
        }
    }

    if (typeof _options.modelUrl === 'string') {
        $.get(_options.modelUrl, function (src) { loadModel.apply(_self, [src]); }, 'json');
    }
    else if (typeof _options.streams === 'object') {
        var defaultStream = {
            streams: _options.streams,
            faces: _options.faces
        };
        loadModel.apply(_self, [defaultStream]);
    }
};