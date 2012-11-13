define(function() {
    return Class.extend({
        init: function() {
            this.image = document.createElement("canvas");
            g.spritewidth = 100 * g.DRAWSCALE;
            g.spriteheight = 100 * g.DRAWSCALE;
            this.image.width = this.width = g.spritewidth;
            this.image.height = this.height = g.spriteheight;
            document.body.appendChild(this.image);
            this.context = this.image.getContext('2d');
        },
        draw: function(context,x,y) {
            var width = this.width,
                height = this.height;
            context.drawImage(this.image, x-width/2, y-height+g.theight/2);
        }
    });
});
