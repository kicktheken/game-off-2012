define(["lib/simplex-noise"], function(SimplexNoise) {
    var _this, zonewidth, zoneheight, zonemap, map, simplex, showqueue, count;
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
            simplex = new SimplexNoise();
            simplex.d = 32;
            simplex.s = Math.random() * simplex.d;
            showqueue = [];
            count = 0;
        },
        tileGenerator: function(x,y) {
            var r = simplex.noise3D(x/simplex.d, y/simplex.d, simplex.s)*.5 +
                    simplex.noise3D(x/simplex.d*2, y/simplex.d*2, simplex.s+64) *.25 +
                    simplex.noise3D(x/simplex.d*4, y/simplex.d*4, simplex.s+128) *.125 +
                    simplex.noise3D(x/simplex.d*8, y/simplex.d*8, simplex.s+256) *.0625;
            var d = simplex.noise3D(x/simplex.d/8, y/simplex.d/8, simplex.s+512);
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
            var maxy = Math.ceil((2*y+1)*zoneheight+g.spriteheight);
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
                    maxy = Math.ceil((2*y+1)*zoneheight+g.spriteheight),
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
            //log.info("mapzone count: "+(++count));
            zonemap[y][x] = imgsrc;
        },
        loadZone: function(x,y) {
            if (zonemap[y] === undefined || zonemap[y][x] === undefined || typeof zonemap[y][x] === "boolean") {
                return false;
            }
            showqueue.push(zonemap[y][x]);
            return zonemap[y][x];
        },
        hide: function() {
            for (var i=0; i<showqueue.length; i++) {
                showqueue[i].hide();
            }
            showqueue = [];
        },
        showLength: function() { return showqueue.length; }
    });
});
