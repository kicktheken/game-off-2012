define(function() {
    return Class.extend({
        init: function(args) {
            if (args.image) {
                this.image = new Image();
                var _this = this;
                this.ready = false;
                this.image.onload = function() {
                    _this.frames = _this.width / this.width * _this.height / this.height;
                    if (!isInt(_this.frames)) {
                        log.warn("file "+this.src+" has noneven frames: "+_this.frames);
                    }
                    _this.ready = true;
                };
                this.width = args.width;
                this.height = args.height;
                this.initOffsets(args);
                this.image.src = args.image;
            } else {
                this.image = document.createElement("canvas");
                this.width = args.width;
                this.height = args.height;
                this.image.width =  this.width * g.DRAWSCALE;
                this.image.height = this.height * g.DRAWSCALE;
                document.body.appendChild(this.image);
                this.context = this.image.getContext('2d');
                if (args.background) {
                    this.context.fillStyle = args.background;
                    this.context.fillRect(0,0,this.image.width,this.image.height);
                }
                if (g.DRAWSCALE > 1) {
                    this.image.style.width = this.width;
                    this.image.style.height = this.height;
                    this.context.scale(g.DRAWSCALE, g.DRAWSCALE);
                }
                this.initOffsets(args);
                this.ready = true;
            }
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
                        this.x -= Math.floor(this.width/2);
                        this.y -= this.height;
                        break;
                    }
                }
            }
        },
        draw: function(context,x,y) {
            context.drawImage(this.image, x+this.x, y+this.y);
        },
        show: function(x,y) {
            tween(this.image).translate(x+this.x, y+this.y).now();
            this.image.style.zIndex = this.z;
            this.image.style.display = 'block';
        },
        hide: function() {
            //log.info([this.x,this.y]+" is hidden");
            this.image.style.display = 'none';
        }
    });
});
