define(function() {
    var count = 0, sprites = new Object(), key, hook;
    var sources = [
        'img/castle_might.png',
        'img/ship.png',
        'img/wood.png',
        'img/ore.png',
        'img/sulfur.png',
        'img/mercury.png'
    ];
    return function(callback) {
        for (var i in sources) {
            key = /\/(\w+)\.\w+$/.exec(sources[i])[1];
            sprites[key] = new Image();
            sprites[key].onload = function() {
                count++;
                this.onload = null;
                if (count >= sources.length) {
                    callback(sprites);
                }
            }
            sprites[key].src = sources[i];
        }
    };
});

