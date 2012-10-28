define(function() {
    var _this, zonewidth, zoneheight, zonemap, map;

    var rcg = [];
    return Class.extend({
        init: function(_zonewidth, _zoneheight) {
            _this = this;
            map = {};
            zonemap = {};
            zonewidth = _zonewidth;
            zoneheight = _zoneheight;
            _this.initColors();
        },
        initColors: function() {
            var blue = _this.generateRCG(function(r) {
                var c = Math.floor(r*101) + 120;
                return [0,c-50,c];
            });
            var yellow = _this.generateRCG(function(r) {
                var c = Math.floor((1-r)*21) + 180;
                return [c,c-20,0];
            });
            var green = _this.generateRCG(function(r) {
                return [80, Math.floor((1-r)*81) + 120, 20];
            });
            var brown = _this.generateRCG(function(r) {
                var c = Math.floor(r*51) + 60;
                return [c,Math.floor(c/3*2),0];
            });
            var white = _this.generateRCG(function(r) {
                var c = Math.floor(r*51) + 200;
                return [c-40,c-20,c];
            });
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            //rcg.push(blue());
            //rcg.push(yellow());
            rcg.push(yellow());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(brown());
            rcg.push(brown());
            rcg.push(brown());
            rcg.push(white());
        },
        generateRCG: function(f) {
            return (function() {
                var count = 0;
                return function() {
                    var index = count;
                    count++;
                    return function(r) {
                         return f(r/count + index/count);
                    };
                };
            })();
        },
        randomColor: function(x,y) {
            var r = g.simplex.noise3D(x/g.simplex.d, y/g.simplex.d, g.simplex.s)*.5 +
                    g.simplex.noise3D(x/g.simplex.d*2, y/g.simplex.d*2, g.simplex.s+64) *.25 +
                    g.simplex.noise3D(x/g.simplex.d*4, y/g.simplex.d*4, g.simplex.s+128) *.125 +
                    g.simplex.noise3D(x/g.simplex.d*8, y/g.simplex.d*8, g.simplex.s+256) *.0625;
            
            var d = g.simplex.noise3D(x/g.simplex.d/8, y/g.simplex.d/8, g.simplex.s+512);
            r = Math.pow((r+1)/2, 1+d) * rcg.length;
            var i = Math.floor(r);
            return rcg[i](r-i);
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
                        map[row][col] = _this.randomColor(col,row);
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
                    var ret = [col,row].concat(map[row][col]);
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
