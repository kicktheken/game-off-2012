Function.prototype.method = function (name, func) {
    if (!this.prototype[name]) {
        this.prototype[name] = func;
    }
    return this;
};

Function.method('curry', function() {
    var slice = Array.prototype.slice,
        args = slice.apply(arguments), that = this;
    return function() {
        return that.apply(null, args.concat(slice.apply(arguments)));
    }
});

Function.prototype.bind = function (bind) {
    var self = this;
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return self.apply(bind || null, args);
    };
};

var isInt = function(n) {
    return (n % 1) === 0;
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// global space
g = {};

