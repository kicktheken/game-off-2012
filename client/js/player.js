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

            var ratio = this.ratio = g.twidth/g.theight;
            // solved from equation:
            // (x^2)/2 + y^2 = 1
            // x = 2y
            this.diagcoef = Math.sqrt(1/(.5*ratio*ratio+1));
            this.speed = 5;
            this.framems = 50;
            this.anim = {
                idle: {
                    S:  {start:0, frames:1},
                    SE: {start:1, frames:1},
                    E:  {start:2, frames:1},
                    NE: {start:3, frames:1},
                    N:  {start:4, frames:1}
                },
                moving: {
                    S:  {start:5, frames:8},
                    SE: {start:13, frames:8},
                    E:  {start:21, frames:8},
                    NE: {start:29, frames:8},
                    N:  {start:37, frames:8}
                }
            };
            this.orientation = 'SE';
            this.flipped = false;
            this.setSrcX('idle');
        },
        setSrcX: function(actiontype) {
            var o = this.orientation, anim;
            if (o.search('W') >= 0) {
                if (!this.flipped) {
                    this.flip();
                }
                o = o.replace('W','E');
            } else if (this.flipped && o.search('E') >= 0) {
                this.flip();
            }
            anim = this.anim[actiontype][o];
            this.srcx = (anim.start+(Math.floor(this.ms/this.framems)%anim.frames))*96+16;
        },
        draw: function(x,y) {
            if (this.ready) {
                var ts = g.ts();
                this.ms += ts - this.ts;
                var actiontype = 'idle';
                if (this.dest.length > 0) {
                    var travel = this.speed*(ts-this.ts)/this.framems,
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
                this.setSrcX(actiontype);
                this.context.clearRect(0,0,this.width,this.height);
                this.context.drawImage(
                    this.image,
                    this.srcx,0,64,64,
                    0,0,64,64
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


