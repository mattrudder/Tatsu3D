
Tatsu.Types = {
    toGLArray: function(gl, type, source) {
        if (type === 'float') {
            return new Float32Array(source);
        }
        else if (type === 'uint16') {
            return new Uint16Array(source);
        }
        else if (type === 'uint32') {
            return new Uint32Array(source);
        }
        else if (type === 'uint8') {
            return new Uint8Array(source);
        }
    },
    toGLType: function(gl, type) {
        if (type === 'float') {
            return gl.FLOAT;
        }
        else if (type === 'uint16') {
            return gl.UNSIGNED_SHORT;
        }
        else if (type === 'uint32') {
            return gl.UNSIGNED_INT;
        }
        else if (type === 'uint8') {
            return gl.UNSIGNED_BYTE;
        }
    }
};