define(["sprite"], function Player(Sprite) {
    return Sprite.extend({
        init: function(anim) {
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
            this.image = new Image();
            this.image.onload = function() {
                _this.ready = true;
            };

            this.ms = 0;
            this.mx = 0;
            this.my = 0;
            this.cx = 0;
            this.cy = 0;
            this.dest = [];

            var ratio = this.ratio = g.twidth/g.theight;
            // solved from equation:
            // (x^2)/2 + y^2 = 1
            // x = 2y
            this.diagcoef = Math.sqrt(1/(.5*ratio*ratio+1));
            this.orientation = 'SE';
            this.flipped = false;
            this.ready = false;

            this.ts = g.ts();
            this.setSrcCoords('idle');
            this.image.src = anim.img;
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
            if (this.ready) {
                var ts = g.ts(), anim = this.anim;
                this.ms += ts - this.ts;
                var actiontype = 'idle';
                if (this.dest.length > 0) {
                    var travel = anim.frame.speed*(ts-this.ts)/100,
                        ratio = this.ratio, diagcoef = this.diagcoef;
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
                                if (travel*diagcoef > Math.abs(dy)) {
                                    // pythagoras is a beast yo
                                    throw (travel -= Math.sqrt((dx*dx+dy*dy)/5));
                                }
                                newy += (dy < 0) ? -travel*diagcoef : travel*diagcoef;
                                newx += (dx < 0) ? -travel*diagcoef*ratio : travel*diagcoef*ratio;
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
            }
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
            return 'player('+this.mx+','+this.my+')';
        }
    });
});


