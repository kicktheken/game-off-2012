define(function() {
    return Class.extend({
        init: function() {
            this.canvas = document.createElement("canvas");
            g.spritewidth = 100 * g.DRAWSCALE;
            g.spriteheight = 100 * g.DRAWSCALE;
            this.canvas.width = g.spritewidth;
            this.canvas.height = g.spriteheight;
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');
        },
        draw: function(context,x,y) {
            var width = this.canvas.width,
                height = this.canvas.height;
            context.drawImage(this.canvas, x-width/2, y-height+g.theight/2);
        }
    });
});
