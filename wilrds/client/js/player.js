define(["sprite"], function Player(Sprite) {
    return Sprite.extend({
        init: function(sprite, anim) {
            var _this = this;
            this.anim = anim;
            this._super({
                width: anim.frame.dest.w,
                height: anim.frame.dest.h,
                justify: 'bottom',
                x: anim.offset.dest.x,
                y: anim.offset.dest.y,
                z: 2
            });
            this.image = sprite;

            this.ms = 0;
            this.mx = 0;
            this.my = 0;
            this.cx = 0;
            this.cy = 0;
            this.sight = 10;
            this.dest = [];
            this.traveled = 0;

            var ratio = this.ratio = g.twidth/g.theight;
            this.orientation = 'SE';
            this.flipped = false;

            this.ts = g.ts();
            this.setSrcCoords('idle');
        },
        setSrcCoords: function(actiontype) {
            var o = this.orientation, anim = this.anim, frame;
            if (o.search('W') >= 0) {
                if (!this.flipped) {
                    this.flip();
                }
                o = o.replace('W','E');
            } else if (this.flipped && o.search('E') >= 0) {
                this.flip();
            }
            frame = anim[actiontype][o];
            this.srcx = (frame.fx+(Math.floor(this.ms/anim.frame.ms)%frame.count))*anim.frame.src.w+anim.offset.src.x;
            this.srcy = frame.fy*anim.frame.src.h+anim.offset.src.y;
        },
        draw: function(x,y) {
            var ts = g.ts(), anim = this.anim;
            this.ms += ts - this.ts;
            var actiontype = 'idle';
            if (this.dest.length > 0) {
                var travel = anim.frame.speed*(ts-this.ts)/100,
                    ratio = this.ratio;
                while (travel && this.dest.length > 0) {
                    var tile = this.dest[0],
                        destx = tile.x*g.twidth/2, newx = 0,
                        desty = tile.y*g.theight/2; newy = 0,
                        dx = destx-this.cx, dy = desty-this.cy;
                    try {
                        if (dx === 0) {
                            this.orientation = (dy < 0) ? 'N' : 'S';
                            if (travel > Math.abs(dy)) {
                                throw (travel -= Math.abs(dy));
                            }
                            newy += (dy < 0) ? -travel : travel;
                        } else if (dy === 0) {
                            this.orientation = (dx < 0) ? 'W' : 'E';
                            if (travel*ratio > Math.abs(dx)) {
                                throw (travel -= Math.abs(dx)/ratio);
                            }
                            newx += (dx < 0) ? -travel*ratio : travel*ratio;
                        } else {
                            this.orientation = (dy < 0) ? 'N' : 'S';
                            this.orientation += (dx < 0) ? 'W' : 'E';
                            if (travel/Math.SQRT2 > Math.abs(dy)) {
                                // pythagoras is a beast yo
                                throw (travel -= Math.sqrt((dx*dx+dy*dy)/5));
                            }
                            newy += (dy < 0) ? -travel/Math.SQRT2 : travel/Math.SQRT2;
                            newx += (dx < 0) ? -travel*Math.SQRT2 : travel*Math.SQRT2;
                        }
                        this.cx += newx;
                        this.cy += newy;
                        travel = 0;
                    } catch(notused) {
                        this.cx = destx;
                        this.cy = desty;
                        this.mx = tile.x;
                        this.my = tile.y;
                        this.dest.shift();
                    }
                }
                actiontype = 'moving';
                this.traveled += anim.frame.speed*(ts-this.ts)/100 - travel;
            }
            this.setSrcCoords(actiontype);
            this.context.clearRect(0,0,this.width,this.height);
            this.context.drawImage(
                this.image,
                this.srcx,this.srcy,anim.frame.dest.w,anim.frame.dest.h,
                0,0,anim.frame.dest.w,anim.frame.dest.h
            );
            this.show(x+this.cx, y+this.cy);
            this.ts = ts;
        },
        setDestination: function(dest) {
            if (this.dest.length === 0) {
                this.dest = dest;
            } else if (dest.length > 0) {
                this.dest = [this.dest[0]].concat(dest);
            }
        },
        getMapCoords: function() {
            if (this.dest.length > 0) {
                return [this.dest[0].x,this.dest[0].y];
            }
            return [this.mx,this.my];
        },
        toString: function() {
            var a = [
                this.mx,
                this.my,
                (this.traveled/g.theight*Math.SQRT2).toFixed(2)
            ]
            return 'player('+a.join()+')';
        }
    });
});


