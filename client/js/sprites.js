define([
    'text!../sprites/castle_might.json',
    'text!../sprites/ship.json',
    'image!img/wood.png',
    'image!img/ore.png',
    'image!img/sulfur.png',
    'image!img/mercury.png'
],
function() {
    var sprites = {};
    for (var i in arguments) {
        var arg = arguments[i], s;
        if (typeof arg === 'string') { // json
            s = arg.replace(/(\w+):/g,'"$1":');
            s = JSON.parse(s);
            sprites[s.id] = s;
        } else { // img
            s = /\/(\w+)\./.exec(arg.src)[1];
            sprites[s] = arg;
        }
    }
    return sprites;
});

