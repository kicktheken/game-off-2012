define(function() {
    var _this, zonewidth, zoneheight, zonemap, map;
    return Class.extend({
        init: function(_zonewidth, _zoneheight) {
            if (typeof _this !== 'undefined') {
                throw "Map is a singleton and cannot be initialized more than once";
            }
            _this = this;
            map = {};
            zonemap = {};
            zonewidth = _zonewidth;
            zoneheight = _zoneheight;
        },
        tileGenerator: function(x,y) {
            var r = g.simplex.noise3D(x/g.simplex.d, y/g.simplex.d, g.simplex.s)*.5 +
                    g.simplex.noise3D(x/g.simplex.d*2, y/g.simplex.d*2, g.simplex.s+64) *.25 +
                    g.simplex.noise3D(x/g.simplex.d*4, y/g.simplex.d*4, g.simplex.s+128) *.125 +
                    g.simplex.noise3D(x/g.simplex.d*8, y/g.simplex.d*8, g.simplex.s+256) *.0625;
            var d = g.simplex.noise3D(x/g.simplex.d/8, y/g.simplex.d/8, g.simplex.s+512);
            return Math.pow((r+1)/2, 1+d);
        },
        assign: function(x,y) {
            if (zonemap[y] === undefined) {
                zonemap[y] = {};
                zonemap[y][x] = false;
                return true;
            } else if (zonemap[y][x] === undefined) {
                zonemap[y][x] = false;
                return true;
            }
            return false;
        },
        initZone: function(x,y) {
            if (zonemap[y] !== undefined) {
                if (zonemap[y][x] !== undefined && zonemap[y][x] === true) {
                    return true;
                }
            } else {
                zonemap[y] = {};
            }
            var maxy = Math.ceil((2*y+1)*zoneheight);
            var maxx = Math.ceil((2*x+1)*zonewidth);
            for (var row=Math.floor((2*y-1)*zoneheight); row <= maxy; row++) {
                for (var col=Math.floor((2*x-1)*zonewidth); col <= maxx; col++) {
                    if (map[row] === undefined) {
                        map[row] = {};
                    }
                    if (map[row][col] === undefined) {
                        map[row][col] = _this.tileGenerator(col,row);
                    }
                }
            }
            //log.info(map);
            zonemap[y][x] = true;
            return true;
        },
        getZoneIterator: function(x,y) {
            if (zonemap[y] === undefined || zonemap[y][x] === undefined) {
                return false;
            }
            return (function() {
                var row = Math.floor((2*y-1)*zoneheight),
                    col = Math.floor((2*x-1)*zonewidth),
                    maxy = Math.ceil((2*y+1)*zoneheight),
                    maxx = Math.ceil((2*x+1)*zonewidth);
                //log.info([col,row,maxx,maxy],true);
                return function() {
                    if (row > maxy) {
                        return false;
                    }
                    if (col > maxx) {
                        row++;
                        if (row > maxy) {
                            return false;
                        }
                        col = Math.floor((2*x-1)*zonewidth);
                    }
                    var ret = [col,row,map[row][col]];
                    col++;
                    return ret;
                };
            })();
        },
        saveZone: function(x,y,imgsrc) {
            if (zonemap[y] === undefined || zonemap[y][x] === undefined) {
                return true; //XXX weird
            }
            zonemap[y][x] = imgsrc;
        },
        loadZone: function(x,y) {
            if (zonemap[y] === undefined || zonemap[y][x] === undefined || typeof zonemap[y][x] === "boolean") {
                return false;
            }
            return zonemap[y][x];
        }
    });
});
