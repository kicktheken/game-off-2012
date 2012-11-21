define(function Overlay() {
    return Class.extend({
        init: function(initfunc) {
            this.omap = {};
            this.initfunc = initfunc;
        },
        setZones: function(col,row,maxx,maxy,loadedFunc,generateFunc) {
            for (var my = row; my <= maxy; my++) {
                for (var mx = col; mx <= maxx; mx++) {
                    if (this.omap[my] === undefined) {
                        this.omap[my] = new Object();
                    }
                    var zone = this.omap[my][mx];
                    if (zone === undefined) {
                        zone = this.initfunc();
                        zone.ready = false;
                        this.omap[my][mx] = zone;
                        generateFunc(zone, mx, my);
                    } else if (zone.ready) {
                        loadedFunc(zone,mx,my);
                    }
                }
            }
        }
    });
});

