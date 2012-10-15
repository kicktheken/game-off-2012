define(function() {
    var _this;
    var canvas, context, twidth, theight, width, height, maxx, maxy, pause;
    var mx, my, map, iterator;
    return Class.extend({
        init: function(_map, _mx, _my, _width, _height, _twidth, _theight) {
            _this = this;
            map = _map;
            width = _width;
            height = _height;
            mx = _mx;
            my = _my;
            twidth = _twidth;
            theight = _theight;
            maxx = Math.ceil(width/twidth);
            maxy = Math.ceil(height/theight);
            pause = true;
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
        drawTile: function(x,y,r,g,b) {
            var xpos, ypos;
            xpos = x*twidth/2 - canvas.width*mx;
            ypos = y*theight/2 - canvas.height*my;
            context.fillStyle = "rgb("+r+","+g+","+b+")";
            context.beginPath();
            context.moveTo(xpos + width/2, ypos + height/2 + theight/2);
            context.lineTo(xpos + width/2 + twidth/2, ypos + height/2);
            context.lineTo(xpos + width/2, ypos + height/2 - theight/2);
            context.lineTo(xpos + width/2 - twidth/2, ypos + height/2);
            context.closePath();
            context.stroke();
            context.fill();

        },
        isPaused:function() { return pause; }
    });
});
