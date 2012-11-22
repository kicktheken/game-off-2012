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
                this.context.clearRect(0,0,this.width,this.height);
                this.context.drawImage(
                    this.image,
                    this.srcx,0,64,64,
                    0,0,64,64
                );
                var actiontype = 'idle';
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
                        if (dx > 0) {
                            if (dy > 0) {
                                this.orientation = 'SE';
                                this.cx += 2;
                                this.cy += 1;
                            } else if (dy < 0) {
                                this.orientation = 'NE';
                                this.cx += 2;
                                this.cy -= 1;
                            } else {
                                this.orientation = 'E';
                                this.cx += 2;
                            }
                        } else if (dx < 0) {
                            if (dy > 0) {
                                this.orientation = 'SW';
                                this.cx -= 2;
                                this.cy += 1;
                            } else if (dy < 0) {
                                this.orientation = 'NW';
                                this.cx -= 2;
                                this.cy -= 1;
                            } else {
                                this.orientation = 'W';
                                this.cx -= 2;
                            }
                        } else {
                            if (dy > 0) {
                                this.orientation = 'S';
                                this.cy += 1;
                            } else if (dy < 0) {
                                this.orientation = 'N';
                                this.cy -= 1;
                            }
                        }
                    }
                    actiontype = 'moving';
                }
                this.show(x+this.cx, y+this.cy);
                this.ms += ts - this.ts;
                this.ts = ts;
                this.setSrcX(actiontype);
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


