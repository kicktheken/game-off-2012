define([
    "lib/class",
    "lib/random",
    "lib/stacktrace",
    "lib/util",
    "lib/log"
],
function() {
    g.IE = /\WMSIE [0-9]\./i.test(navigator.userAgent);
    if (g.IE) {
        require(["lib/typedarray", "main"]);
    } else {
        require(["main"]);
    }
});

