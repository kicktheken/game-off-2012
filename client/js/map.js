define([
    "lib/simplex-noise",
    "tile"
],
function Map(SimplexNoise, Tile) {
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
                var ret = _this.getTile(col,row);
                col++;
                return ret;
            };
        },
        getTile: function(x,y) {
            if (map[y] === undefined) {
                map[y] = {};
            }
            if (map[y][x] === undefined) {
                map[y][x] = new Tile(simplex,x,y);
            }
            return map[y][x];
        }
    });
});
