/*jslint plusplus: false, forin: false, noarg: false */

var Tatsu = Tatsu || { Version: '0.1' };

(function () {

    if (!window.Int32Array) {
        window.Int32Array = Array;
        window.Float32Array = Array;
    }

    // NOTE: Doesn't work with our method of code structure.
    //       Either need a new method, or a new way of identifying object instances.
    // Tatsu.getType = function(obj) {
    //     if (obj && obj.constructor && obj.constructor.toString) {
    //         var arr = obj.constructor.toString().match(/function\s*(\w+)/);
    //         if (arr && arr.length === 2){
    //             return arr[1]
    //         }
    //     }

    //     return undefined;
    // };

    // requestAnimationFrame polyfill
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = 
              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());
}());
