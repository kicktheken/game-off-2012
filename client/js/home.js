define([
    "lib/class",
    "lib/random",
    "lib/stacktrace",
    "lib/util",
    "lib/log",
    "lib/tinycolor",
    "lib/" + (/\WMSIE\W/.test(navigator.userAgent) ? 'jquery' : 'zepto')
],
function() {
    require(["main"]);
});

