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
            this.t = 0;
            this.srcx = (13*96)+16;
            this.x = 0;
            this.y = 0;
        },
        draw: function(context,x,y) {
            if (this.ready) {
                var d = g.DRAWSCALE;
                context.drawImage(this.image,this.srcx,0,64,64, this.x+x-32*d,this.y+y-60*d,64*d,64*d);
                this.t++;
                this.srcx = (13+(Math.floor(this.t/3)%8))*96+16;
            }
        }
    });
});


