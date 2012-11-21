define(["sprite"], function Player(Sprite) {
    return Sprite.extend({
        init: function(imagepath) {
            this._super({
                width: 64,
                height: 64,
                justify: 'bottom',
                x: 0,
                y: 4,
                z: 2
            });
            var _this = this;
            this.image = new Image();
            this.ready = false;
            this.image.onload = function() {
                _this.ready = true;
            };
            this.image.src = imagepath;
            this.ts = g.ts();
            this.ms = 0;
            this.mx = 0;
            this.my = 0;
            this.cx = 0;
            this.cy = 0;
            this.dest = [];
            this.srcx = (13*96)+16;
        },
        draw: function(x,y) {
            if (this.ready) {
                var ts = g.ts();
                this.context.clearRect(0,0,this.width,this.height);
                this.context.drawImage(
                    this.image,
                    this.srcx,0,64,64,
                    0,0,64,64
                );
                if (this.dest.length > 0) {
                    var tile = this.dest[0],
                        destx = tile.x*g.twidth/2,
                        desty = tile.y*g.theight/2;
                    //log.info([destx,desty, this.cx,this.cy]);
                    if (this.cx == destx && this.cy == desty) {
                        //log.info([tile.x,tile.y]);
                        this.mx = tile.x;
                        this.my = tile.y;
                        this.dest.shift();
                    } else {
                        var dx = destx-this.cx, dy = desty-this.cy;
                        this.cx += (dx) ? dx / Math.abs(dx) * 2 : 0;
                        this.cy += (dy) ? dy / Math.abs(dy) : 0;
                    }
                }
                //log.info([this.cx,this.cy]);
                //log.info([this.mx*g.twidth/2,this.my*g.theight/2]);
                //this.show(x+this.mx*g.twidth/2, y+this.my*g.theight/2);
                this.show(x+this.cx, y+this.cy);
                this.ms += ts - this.ts;
                this.ts = ts;
                this.srcx = (13+(Math.floor((this.ms)/50)%8))*96+16;
            }
        },
        setDestination: function(dest) {
            if (this.dest.length === 0) {
                this.dest = dest;
            } else if (dest.length > 0) {
                this.dest = [this.dest[0]].concat(dest);
            }
        }
    });
});


