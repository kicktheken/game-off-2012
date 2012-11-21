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
            this.srcx = (13*96)+16;
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
                this.show(x+this.mx*g.twidth/2,  y+this.my*g.theight/2);
                this.ms += ts - this.ts;
                this.ts = ts;
                this.srcx = (13+(Math.floor((this.ms)/50)%8))*96+16;
            }
        }
    });
});


