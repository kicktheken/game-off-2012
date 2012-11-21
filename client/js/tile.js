define(function Tile() {
    return Class.extend({
        init: function(simplex, x, y) {
            var r = simplex.noise3D(x/simplex.d, y/simplex.d, simplex.s)*.5 +
                    simplex.noise3D(x/simplex.d*2, y/simplex.d*2, simplex.s+64) *.25 +
                    simplex.noise3D(x/simplex.d*4, y/simplex.d*4, simplex.s+128) *.125 +
                    simplex.noise3D(x/simplex.d*8, y/simplex.d*8, simplex.s+256) *.0625;
            var d = simplex.noise3D(x/simplex.d/8, y/simplex.d/8, simplex.s+512);
            this.r = Math.pow((r+1)/2, 1+d);
            this.x = x;
            this.y = y;
        },
        isDrawable: function() {
            return (this.x+this.y) % 2 === 0;
        },
        isPassable: function() {
            return (this.r >= .5 && this.r <= .8);
        },
        getData: function() {
            return [this.x,this.y,this.r];
        }
    });
});

