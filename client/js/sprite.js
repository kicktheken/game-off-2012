define(function() {
    return Class.extend({
        init: function() {
            this.canvas = document.createElement("canvas");
            this.canvas.width = 100;
            this.canvas.height = 100;
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
