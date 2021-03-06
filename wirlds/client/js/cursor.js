define(["sprite"], function Cursor(Sprite) {
    var maxv = 20;
    var Cursor = Sprite.extend({
        init: function() {
            this._super({
                width:  g.twidth+6,
                height: g.theight+6,
                justify:"center",
                z: 3
            });
            this.cx = -g.twidth; // hide cursor
            this.cy = -g.theight;
            this.down = false;
            this.vs = [];
            this.ts = 0;
            this.context.translate(3,3);
            this.drawCursor(true);
        },
        press: function(x,y) {
            this.cx = x;
            this.cy = y;
            this.ts = g.ts();
            this.down = true;
        },
        release: function() {
            this.down = false;
            var dx,dy,dt,v,vs = this.vs;
            this.vs = [];
            if (vs.length <= 1) {
                return;
            } else { // look at the last two to resolve the (backwards glitch)
                var a = anglediff(vs[0].dx,vs[0].dy,vs[1].dx,vs[1].dy),
                    i = (Math.abs(a) > Math.PI/2) ? 1 : 0;
                dx = vs[i].dx;
                dy = vs[i].dy;
                dt = vs[i].dt;
            }
            v = Math.sqrt(dx*dx+dy*dy) / dt * 1000 / 60;
            if (v > maxv) v = maxv;
            return [v,dx,dy];
        },
        move: function(x,y) {
            var dx = this.cx - x,
                dy = this.cy - y,
                ts = g.ts();
            if (this.down && ts > this.ts) {
                this.vs.unshift({dx:dx,dy:dy,dt:ts-this.ts});
            }
            this.cx = x;
            this.cy = y;
            this.ts = ts;
            return [dx,dy];
        },
        isDown: function() {
            return this.down;
        },
        setCoords: function() {
            var x = this.cx, y = this.cy,
                m = g.Camera.cursor2map(x,y),
                n = g.Camera.map2cursor(m.mx,m.my);
            if ((m.mx+m.my)%2 !== 0) {
                if ((y-n.y)*g.theight > (x-n.x)*g.twidth) {
                    if ((y-n.y)*g.theight > -(x-n.x)*g.twidth) {
                        m.my++;
                    } else {
                        m.mx--;
                    }
                } else {
                    if ((y-n.y)*g.theight > -(x-n.x)*g.twidth) {
                        m.mx++;
                    } else {
                        m.my--;
                    }
                }
                n = g.Camera.map2cursor(m.mx, m.my);
            }
            this.mx = m.mx;
            this.my = m.my;
            this.cx = n.x;
            this.cy = n.y;
        },
        drawCursor: function(passable) {
            var context = this.context, c1, c2;
            if (passable) {
                c1 = "rgb(100,255,100)";
                c2 = "rgba(0,128,0,.5)";
            } else {
                c1 = "rgb(255,0,0)";
                c2 = "rgba(128,0,0,.5)";
            }
            context.clearRect(0,0,this.width,this.height);
            context.lineWidth = 3;
            context.strokeStyle = c1;
            context.fillStyle = c2;
            context.beginPath();
            context.moveTo(g.twidth/2, 0);
            context.lineTo(g.twidth, g.theight/2);
            context.lineTo(g.twidth/2, g.theight);
            context.lineTo(0, g.theight/2);
            context.closePath();
            context.stroke();
            context.fill();
        },
        draw: function() {
            this.setCoords();
            var tile = g.Map.getTile(this.mx,this.my);
            this.drawCursor(tile.isPassable());
            this.show(this.cx,this.cy);
        }
    });

    // returns 0 <= x < 2*PI
    function cart2rad(x,y) {
        if (x === 0) {
            return (y === 0) ? 0 : (y > 0) ? Math.PI/2 : 3*Math.PI/2;
        }
        return (x > 0) ? Math.atan(y/x) : Math.PI+Math.atan(y/x);
    }

    // return -PI <= x < PI
    function anglediff(x1,y1,x2,y2) {
        var rad = cart2rad(x2,y2) - cart2rad(x1,y1);
        return (rad < -Math.PI) ? rad+Math.PI : (rad >= Math.PI) ? rad-Math.PI : rad;
    }

    return Cursor;
});


