define([
    "lib/simplex-noise",
    "astar",
    "tile"
],
function Map(SimplexNoise, AStar, Tile) {
    var _this, map, simplex, showqueue;
    return AStar.extend({
        init: function() {
            if (typeof _this !== 'undefined') {
                throw "Map is a singleton and cannot be initialized more than once";
            }
            this._super();
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
        },
        findPath: function(startx, starty, endx, endy) {
            var start = _this.getTile(startx,starty),
                end = _this.getTile(endx,endy);
            log.info(start+end);
            if (!start.isPassable() || !end.isPassable()) {
                return [];
            }
            return _this.search(start,end);
        },
        neighbors: function(node) {
            var ret = [];
            var x = node.x;
            var y = node.y;

            // Southwest
            ret.push(_this.getTile(x-1,y-1));

            // Southeast
            ret.push(_this.getTile(x+1,y-1));

            // Northwest
            ret.push(_this.getTile(x-1,y+1));

            // Northeast
            ret.push(_this.getTile(x+1,y+1));

            // West
            ret.push(_this.getTile(x-2,y));

            // East
            ret.push(_this.getTile(x+2,y));

            // South
            ret.push(_this.getTile(x,y-2));

            // North
            ret.push(_this.getTile(x,y+2));
            return ret;
        }
    });
});
