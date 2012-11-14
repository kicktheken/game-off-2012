define(function() {
    return Class.extend({
        init: function() {
            if (typeof arguments[0] === "string") {
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
                this.width = arguments[1];
                this.height = arguments[2];
                this.image.src = arguments[0];
            } else {
                this.image = document.createElement("canvas");
                this.image.width = this.width = arguments[0];
                this.image.height = this.height = arguments[1];
                document.body.appendChild(this.image);
                this.context = this.image.getContext('2d');
                if (arguments.length > 2) {
                    var offsetx = 0, offsety = 0;
                    if (arguments.length > 4) {
                        offsetx = arguments[3];
                        offsety = arguments[4];
                    }
                    switch (arguments[2]) {
                        case "center": {
                            this.x = -this.width/2 + offsetx;
                            this.y = -this.height/2 + offsety;
                            break;
                        } case "bottom": {
                            this.x = -this.width/2 + offsetx;
                            this.y = -this.height + offsety;
                            break;
                        } default: {
                            this.x = 0;
                            this.y = 0;
                        }
                    }
                } else {
                    this.x = 0;
                    this.y = 0;
                }
                this.ready = true;
            }
        },
        draw: function(context,x,y) {
            context.drawImage(this.image, x+this.x, y+this.y);
        }
    });
});
