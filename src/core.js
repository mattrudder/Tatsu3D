/*jslint plusplus: false, forin: false, noarg: false */

var Tatsu = (function () {
	var initializing = false;

	// http://ejohn.org/blog/simple-javascript-inheritance/
	this.Class = function () {};
	
	this.Class.verifyArguments = function (types, args) {
		var i;
		
		if (types.length !== args.length) {
			throw "Invalid number of arguments. Expected " + types.length +
				", recieved " + args.length + " instead.";
		}
		
		for (i = 0; i < args.length; ++i) {
			if (args[i].constructor !== types[i]) {
				throw "Invalid argument type. Expected " + types[i].name +
					", recieved " + args[i].constructor.name + " instead.";
			}
		}
	};
	
	this.Class.extend = function (prop) {
		var base = this.prototype;
		
		// Instantiate a base class (but only creat the instance, don't run init method)
		initializing = true;
		var proto = new this();
		initializing = false;
		
		var fnMaker = function (name, fn) {
			return function() {
				var tmp = this.base;
				
				// Add a new .base() method that is the same method
				// but on the base class
				this.base = base[name];
				
				// The method only needs to be bound temporarily, so
				// we remove it when we're done executing.
				var ret = fn.apply(this, arguments);
				this.base = tmp;
				
				return ret;
			};
		};
		
		// Copy the properties over onto the new prototype
		for (var name in prop) {
			proto[name] = typeof prop[name] == "function" &&
				typeof base[name] == "function" && fnText.test(prop[name]) ?
				fnMaker(name, prop[name]) :
				prop[name];
		}
		
		// The dummy class constructor
		function Class() {
			// All construction is actually done in the object's init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}
		
		// Populate our constructed prototype object
		Class.prototype = proto;
		
		// Enforce the constructor to be what we expect
		Class.constructor = Class;
		
		// And make this class extendable
		Class.extend = arguments.callee;
		
		return Class;
	};


})();