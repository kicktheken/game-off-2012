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
            g['Map'] = this;
            map = {};
            simplex = new SimplexNoise();
            _this.setupNoise();
        },
        setupNoise: function() {
            // ensure player starts on land
            function generateNoiseFunction(size) {
                var rx = Math.random(), ry = Math.random(), rz = Math.random();
                return function(x,y) {
                    return simplex.noise3D((x+rx)/size, (y+ry)/size, rz*size);
                };
            };
            var sizes = [32, 16, 8, 4], noises = [], pnoises = [];
            for (var i in sizes) {
                for (var k=0; k<1000; k++) {
                    noises[i] = generateNoiseFunction(sizes[i]);
                    var r = noises[i](0,0);
                    if (r > .1 && r < .3) {
                        break;
                    }
                }
            }
            simplex.noiseR = function(x,y) {
                return noises[0](x,y)/2 + noises[1](x,y)/4
                     + noises[2](x,y)/8 + noises[3](x,y)/16;
            };
            for (var k=0; k<1000; k++) {
                simplex.noiseD = generateNoiseFunction(256);
                var r = simplex.noiseD(0,0);
                if (r > -.2 && r < 0) {
                    break;
                }
            }

            sizes = [128, 64, 32];
            for (var i in sizes) {
                pnoises[i] = generateNoiseFunction(sizes[i]);
            }
            simplex.noiseP = function(x,y) {
                return pnoises[0](x,y)/2 + pnoises[1](x,y)/4 + pnoises[2](x,y)/8;
            }
            for (var k=0; k<1000; k++) {
                simplex.noiseB = generateNoiseFunction(16);
                var r = simplex.noiseB(0,0);
                if (r < 0) {
                    break;
                }
            }
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
        getCircleIterator: function(x,y,radius) {
            var row = y-radius, col = x-radius,
                maxy = y+radius, maxx = x+radius;
            return function() {
                while(true) {
                    if (row > maxy) {
                        return false;
                    }
                    if (col > maxx) {
                        row++;
                        if (row > maxy) {
                            return false;
                        }
                        col = x-radius;
                    }
                    var dist = Math.sqrt((col-x)*(col-x)+(row-y)*(row-y));
                    if (radius >= dist) {
                        var ret = _this.getTile(col,row);
                        col++;
                        return ret;
                    }
                    col++;
                }
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
            log.info(start+' -> '+end);
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
