define(['text!../sprites/castle_might.json',
        'text!../sprites/ship.json'], function() {
    var sprites = {};
    for (var i in arguments) {
        var s = arguments[i], sprite;
        s = s.replace(/(\w+):/g,'"$1":');
        sprite = JSON.parse(s);
        sprites[sprite.id] = sprite;
    }
    return sprites;
});

