define(function Sprite() {
    return Class.extend({
        init: function(args) {
            this.width = args.width;
            this.height = args.height;
            this.scale = getDefault(args.scale, g.SCALE);
            if (args.img) {
                var _this = this;
                if (typeof args.img === 'string') {
                    this.canvas = new Image();
                    this.canvas.width =  this.width;
                    this.canvas.height = this.height;
                    this.canvas.onload = function() {
                        if (!args.standalone) {
                            document.body.appendChild(this);
                        }
                        _this.ready = true;
                    }
                    this.ready = false;
                    this.canvas.src = args.img;
                } else {
                    this.canvas = args.img;
                    this.canvas.width =  this.width;
                    this.canvas.height = this.height;
                    this.ready = true;
                }
            } else {
                this.canvas = document.createElement("canvas");
                this.canvas.width =  this.width * this.scale;
                this.canvas.height = this.height * this.scale;
                if (!args.standalone) {
                    document.body.appendChild(this.canvas);
                }
                this.context = this.canvas.getContext('2d');
                if (args.background) {
                    this.context.fillStyle = args.background;
                    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
                }
                if (this.scale > 1) {
                    this.context.scale(this.scale, this.scale);
                    this.canvas.style.width = this.width + 'px';
                    this.canvas.style.height = this.height + 'px';
                }
                this.ready = true;
            }
            this.initOffsets(args);
        },
        initOffsets: function(args) {
            this.x = getDefault(args.x, 0);
            this.y = getDefault(args.y, 0);
            this.z = getDefault(args.z, this.y);
            if (args.justify) {
                switch (args.justify) {
                    case "center": {
                        this.x -= this.width/2;
                        this.y -= this.height/2;
                        break;
                    } case "bottom": {
                        this.x -= this.width/2;
                        this.y -= this.height;
                        break;
                    }
                }
            }
            this.canvas.style.zIndex = this.z;
        },
        draw: function(context,x,y) {
            if (this.ready) {
                context.drawImage(
                    this.canvas,
                    0, 0, this.canvas.width, this.canvas.height,
                    x+this.x, y+this.y, this.width, this.height
                );
            }
        },
        show: function(x,y) {
            translate(this.canvas, x+this.x, y+this.y);
            this.canvas.style.display = 'block';
        },
        hide: function() {
            this.canvas.style.display = 'none';
        },
        isHidden: function() {
            return this.canvas.style.display === 'none';
        },
        flip: function() { // flip image horzontally
            this.context.translate(this.width, 0);
            this.context.scale(-1,1);
            this.flipped = !this.flipped;
        },
        hueRotate: function(deg) {
            // TODO: optimize this slow function
            // alternative is to save the different hue sprite to a new image
            if (this.canvas instanceof Image) {
                var canvas = document.createElement("canvas"),
                    context = canvas.getContext('2d'),
                    width = this.width,
                    height = this.height, data;
                canvas.width = width;
                canvas.height = height;
                context.drawImage(this.canvas,0,0);
                data = context.getImageData(0,0,width,height);
                for (var i=0; i<data.data.length; i+=4) {
                    var d = data.data, hsv, rgb;
                    if (d[i+3] <= 0) { // ignore 0 alpha
                        continue;
                    }
                    rgb = {r:d[i],g:d[i+1],b:d[i+2]};
                    hsv = tinycolor(rgb).toHsv();
                    hsv.h = (deg+hsv.h);
                    if (hsv.h > 360) {
                        hsv.h -= 360;
                    }
                    rgb = tinycolor(hsv).toRgb();
                    data.data[i] = rgb.r;
                    data.data[i+1] = rgb.g;
                    data.data[i+2] = rgb.b;
                }
                context.putImageData(data,0,0);
                this.canvas = canvas;
                this.context = context;
            }
        }
    });
});
