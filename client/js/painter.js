define(["lsystems"],function(LSystems) {
    var _this;
    var canvas, context, twidth, theight, width, height, maxx, maxy, pause;
    var mx, my, map, iterator, rcg = [], lsystem;
    var Painter = Class.extend({
        init: function(_map, _mx, _my, _width, _height, _twidth, _theight) {
            _this = this;
            map = _map;
            // width and height increased to fix seaming problems
            width = _width + 1;
            height = _height + 1;
            mx = _mx;
            my = _my;
            twidth = _twidth;
            theight = _theight;
            maxx = Math.ceil(width/twidth);
            maxy = Math.ceil(height/theight);
            pause = true;
            lsystem = new LSystems();
            lsystem.draw();
            _this.initCanvas();
        },
        initCanvas: function() {
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            document.body.appendChild(canvas);
            context = canvas.getContext('2d');
        },
        assign: function(_mx, _my) {
            if (pause) {
                mx = _mx;
                my = _my;
                pause = false;
                _this.initCanvas();
                context.fillStyle = 'white';
                context.fillRect(0,0,width,height);
                return true;
            }
            return false;
        },
        getSrc: function() {
            return canvas.toDataURL();
        },
        save: function() {
            return map.saveZone(mx,my,canvas);
        },
        generateTilesInScreen: function(step) {
            if (pause) {
                return false;
            }
            if (!iterator) {
                iterator = map.getZoneIterator(mx,my);
            }
            for (var i=0; i<step; i++) {
                var data = iterator();
                if (!data) {
                    pause = true;
                    iterator = null;
                    return true;
                }
                if ((data[0]+data[1]) % 2 === 0) {
                    _this.drawTile.apply(null, data);
                }
            }
            return false;
        },
        drawTile: function(x,y,r) {
            var xpos, ypos, c, i;

            // initialize drawn coords (compensated to fix seaming problems)
            xpos = x*twidth/2 - (width-1)*mx + width/2;
            ypos = y*theight/2 - (height-1)*my + height/2;

            // set color
            r *= rcg.length;
            i = Math.floor(r);
            c = rcg[i](r-i);
            context.fillStyle = "rgb("+c[0]+","+c[1]+","+c[2]+")";

            // draw on context
            context.beginPath();
            context.moveTo(xpos, ypos + theight/2);
            context.lineTo(xpos + twidth/2, ypos);
            context.lineTo(xpos, ypos - theight/2);
            context.lineTo(xpos - twidth/2, ypos);
            context.closePath();
            context.stroke();
            context.fill();

            // draw tree
            if (r/rcg.length > .8) {
                context.drawImage(lsystem.getCanvas(),xpos-50,ypos-100);
            }
        },
        isPaused:function() { return pause; }
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
