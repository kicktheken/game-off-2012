define(function Camera() {
    return Class.extend({
        init: function() {
            this.x = 0;
            this.y = 0;
            g['Camera'] = this;
        },
        setDimensions: function(width,height) {
            this.width = width;
            this.height = height;
            document.body.style.width = width;
            document.body.style.height = height;
            log.info("engine resize to "+width+"x"+height+" ts:"+(g.ts() - g.INITTIME));
        },
        moveCenter: function(x,y) {
            this.x += x;
            this.y += y;
        },
        toString: function() {
            return 'camera('+this.x+','+this.y+')';
        },
        // conversions helpers
        cursorCenter: function() {
            return {
                x: this.width/2 - this.x,
                y: this.height/2 - this.y
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

