define(function() {
    return Class.extend({
        init: function(initfunc) {
            this.omap = {};
            this.initfunc = initfunc;
        },
        setZones: function(col,row,maxx,maxy,loadedFunc,generateFunc) {
            for (var my = row; my <= maxy; my++) {
                for (var mx = col; mx <= maxx; mx++) {
                    var zone = this.initZone(mx,my);
                    if (zone.ready) {
                        loadedFunc(zone,mx,my);
                    } else {
                        generateFunc(zone,mx,my);
                    }
                }
            }
        },
        initZone: function(x, y) {
            if (this.omap[y] === undefined) {
                this.omap[y] = new Object();
            }
            if (this.omap[y][x] === undefined) {
                this.omap[y][x] = this.initfunc();
                this.omap[y][x].ready = false;
            }
            return this.omap[y][x];
        }
    });
});

