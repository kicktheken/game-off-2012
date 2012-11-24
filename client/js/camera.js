define(function Camera() {
    var _this;
    return Class.extend({
        init: function() {
            if (typeof _this !== 'undefined') {
                throw "Camera is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g['Camera'] = this;
            this.x = 0;
            this.y = 0;
            this.maxx = 0;
            this.maxy = 0;
            this.minx = 0;
            this.miny = 0;
        },
        setDimensions: function(width,height) {
            this.width = width;
            this.height = height;
            document.body.style.width = width;
            document.body.style.height = height;
            log.info("engine resize to "+width+"x"+height+" ts:"+(g.ts() - g.INITTIME));
        },
        moveCenter: function(x,y) {
            if (g.MAPREVEAL) {
                this.x += x;
                this.y += y;
                return;
            }
            var newx = this.x + x, newy = this.y + y;
            if (newx > this.maxx) {
                this.x = this.maxx;
            } else if (newx < this.minx) {
                this.x = this.minx;
            } else {
                this.x = newx;
            }
            if (newy > this.maxy) {
                this.y = this.maxy;
            } else if (newy < this.miny) {
                this.y = this.miny;
            } else {
                this.y = newy;
            }
        },
        toString: function() {
            return 'camera('+this.x+','+this.y+')';
        },
        updateBounds: function(mx,my) {
            this.maxx = Math.max(mx*g.twidth/2,this.maxx);
            this.maxy = Math.max(my*g.theight/2,this.maxy);
            this.minx = Math.min(mx*g.twidth/2,this.minx);
            this.miny = Math.min(my*g.theight/2,this.miny);
        },
        // conversions helpers
        cursorCenter: function() {
            return {
                x: this.width/2 - Math.round(this.x),
                y: this.height/2 - Math.round(this.y)
            };
        },
        cursor2map: function(x,y) {
            return {
                mx: Math.round((x+this.x-this.width/2)/g.twidth*2),
                my: Math.round((y+this.y-this.height/2)/g.theight*2)
            };
        },
        map2cursor: function(mx,my) {
            return {
                x: mx*g.twidth/2 - this.x + this.width/2,
                y: my*g.theight/2 - this.y + this.height/2
            };
        },
        zone2cursor: function(dsize,zx,zy) {
            return {
                x: zx*dsize - Math.round(this.x) + this.width/2,
                y: zy*dsize - Math.round(this.y) + this.height/2
            };
        },
        isZoneVisible: function(dsize,size,zx,zy) {
            var x = zx*dsize - Math.round(this.x) + this.width/2,
                y = zy*dsize - Math.round(this.y) + this.height/2;
            return (x >= -size/2 && x <= this.width+size/2 &&
                    y >= -size/2 && y <= this.height+size/2);
        },
        getZoneBounds: function(dsize) {
            var centerx = Math.round(this.x),
                centery = Math.round(this.y),
                x = Math.floor(centerx/dsize + .5),
                y = Math.floor(centery/dsize + .5),
                modx = Math.round(centerx + dsize/2)%dsize,
                mody = Math.round(centery +dsize/2)%dsize;
            if (modx < 0) modx = dsize + modx;
            if (mody < 0) mody = dsize + mody;
            return {
                col: x-Math.ceil((this.width/2 - modx)/dsize),
                row: y-Math.ceil((this.height/2 - mody)/dsize),
                maxx: x+Math.ceil((this.width/2 - dsize + modx)/dsize),
                maxy: y+Math.ceil((this.height/2 - dsize + mody)/dsize)
            };
        }
    });
});

