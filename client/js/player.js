define(["sprite"], function(Sprite) {
    return Sprite.extend({
        init: function(imagepath) {
            var _this = this;
            this.image = new Image();
            this.ready = false;
            this.image.onload = function() {
                _this.ready = true;
            };
            this.image.src = imagepath;
            this.ts = g.ts();
            this.ms = 0;
            this.srcx = (13*96)+16;
        },
        draw: function(context,x,y) {
            if (this.ready) {
                var ts = g.ts();
                context.drawImage(this.image,this.srcx,0,64,64, x-32,y-60,64,64);
                this.ms += ts - this.ts;
                this.ts = ts;
                this.srcx = (13+(Math.floor((this.ms)/50)%8))*96+16;
            }
        }
    });
});


