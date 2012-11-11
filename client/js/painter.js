define(["lsystems"],function(LSystems) {
    var rcg = [], lsystem;
    var Painter = Class.extend({
        init: function(map, mx, my, width, height, twidth, theight) {
            this.map = map;
            // width and height increased to fix seaming problems
            this.width = width + 1;
            this.height = height + 1;
            this.mx = mx;
            this.my = my;
            this.twidth = twidth;
            this.theight = theight;
            this.maxx = Math.ceil(width/twidth);
            this.maxy = Math.ceil(height/theight);
            this.pause = true;
            if (typeof lsystem === 'undefined') {
                lsystem = new LSystems();
                lsystem.draw();
            }
            this.initCanvas();
        },
        initCanvas: function() {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');
        },
        assign: function(mx, my) {
            if (this.pause) {
                this.mx = mx;
                this.my = my;
                this.pause = false;
                this.initCanvas();
                this.context.fillStyle = 'white';
                this.context.fillRect(0,0,this.width,this.height);
                return true;
            }
            return false;
        },
        save: function() {
            return this.map.saveZone(this.mx,this.my,this.canvas);
        },
        generateTilesInScreen: function(step) {
            if (this.pause) {
                return false;
            }
            if (!this.iterator) {
                this.iterator = this.map.getZoneIterator(this.mx,this.my);
            }
            for (var i=0; i<step; i++) {
                var data = this.iterator();
                if (!data) {
                    this.pause = true;
                    this.iterator = null;
                    return true;
                }
                if ((data[0]+data[1]) % 2 === 0) {
                    this.drawTile.apply(this, data);
                }
            }
            return false;
        },
        drawTile: function(x,y,r) {
            var xpos, ypos, c, i;

            // initialize drawn coords (compensated to fix seaming problems)
            xpos = x*this.twidth/2 - (this.width-1)*this.mx + this.width/2;
            ypos = y*this.theight/2 - (this.height-1)*this.my + this.height/2;

            // set color
            r *= rcg.length;
            i = Math.floor(r);
            c = rcg[i](r-i);
            this.context.fillStyle = "rgb("+c[0]+","+c[1]+","+c[2]+")";

            // draw on context
            this.context.beginPath();
            this.context.moveTo(xpos, ypos + this.theight/2);
            this.context.lineTo(xpos + this.twidth/2, ypos);
            this.context.lineTo(xpos, ypos - this.theight/2);
            this.context.lineTo(xpos - this.twidth/2, ypos);
            this.context.closePath();
            this.context.stroke();
            this.context.fill();

            // draw tree
            if (r/rcg.length > .8) {
                this.context.drawImage(lsystem.getCanvas(),xpos-50,ypos-100);
            }
        },
        isPaused:function() { return this.pause; }
    });

    // initialize color generators
    (function initColor(generateRCG) {
        var blue = generateRCG(function(r) {
                var c = Math.floor(r*101) + 120;
                return [0,c-50,c];
            });
            var yellow = generateRCG(function(r) {
                var c = Math.floor((1-r)*21) + 180;
                return [c,c-20,0];
            });
            var green = generateRCG(function(r) {
                return [80, Math.floor((1-r)*81) + 120, 20];
            });
            var brown = generateRCG(function(r) {
                var c = Math.floor(r*51) + 60;
                return [c,Math.floor(c/3*2),0];
            });
            var white = generateRCG(function(r) {
                var c = Math.floor(r*51) + 200;
                return [c-40,c-20,c];
            });
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(yellow());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(brown());
            rcg.push(brown());
            rcg.push(brown());
            rcg.push(white());
    })(function(f) {
        return (function() {
            var count = 0;
            return function() {
                var index = count;
                count++;
                return function(r) {
                     return f(r/count + index/count);
                };
            };
        })();
    });

    return Painter;
});
