define(["lib/simplex-noise"], function(SimplexNoise) {
    var _this, map, simplex, showqueue;
    return Class.extend({
        init: function() {
            if (typeof _this !== 'undefined') {
                throw "Map is a singleton and cannot be initialized more than once";
            }
            _this = this;
            map = {};
            simplex = new SimplexNoise();
            simplex.d = 32;
            simplex.s = Math.random() * simplex.d;
        },
        tileGenerator: function(x,y) {
            var r = simplex.noise3D(x/simplex.d, y/simplex.d, simplex.s)*.5 +
                    simplex.noise3D(x/simplex.d*2, y/simplex.d*2, simplex.s+64) *.25 +
                    simplex.noise3D(x/simplex.d*4, y/simplex.d*4, simplex.s+128) *.125 +
                    simplex.noise3D(x/simplex.d*8, y/simplex.d*8, simplex.s+256) *.0625;
            var d = simplex.noise3D(x/simplex.d/8, y/simplex.d/8, simplex.s+512);
            return Math.pow((r+1)/2, 1+d);
        },
        getZoneIterator: function(x,y,maxx,maxy) {
            //log.info([x,y,_maxx,_maxy]);
            var row = y, col = x;
            return function() {
                if (row > maxy) {
                    return false;
                }
                if (col > maxx) {
                    row++;
                    if (row > maxy) {
                        return false;
                    }
                    col = x;
                }
                var ret = [col,row,_this.getTile(col,row)];
                col++;
                return ret;
            };
        },
        getTile: function(x,y) {
            if (map[y] === undefined) {
                map[y] = {};
            }
            if (map[y][x] === undefined) {
                map[y][x] = _this.tileGenerator(x,y);
            }
            return map[y][x];
        }
    });
});
