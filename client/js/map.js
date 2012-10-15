define(function() {
    var _this, zonewidth, zoneheight, zonemap, map;
    var rcg = []; //random color generators
    rcg.push(function() { return [80,Math.floor(Math.random()*81)+150,20] }); // green
    rcg.push(function() { var c = Math.floor(Math.random()*101)+150;return [0,c-50,c]}); // blue
    rcg.push(function() { var c = Math.floor(Math.random()*51)+150; return [c,c-20,0] }); // yellow
    rcg.push(function() { var c = Math.floor(Math.random()*51)+60; return [c,Math.floor(c/3*2),0] }); // brown

    return Class.extend({
        init: function(_zonewidth, _zoneheight) {
            _this = this;
            map = {};
            zonemap = {};
            zonewidth = _zonewidth;
            zoneheight = _zoneheight;
        },
        randomColor: function() {
            return rcg[Math.floor(Math.random()*rcg.length)]();
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
            //log.info(zonemap[y][x]);
            //log.info([x,y]);
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
                        map[row][col] = _this.randomColor();
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
