define(function() {
    return Class.extend({
        init: function(args) {
            this.canvas = document.createElement("canvas");
            this.width = args.width;
            this.height = args.height;
            this.scale = getDefault(args.scale, g.SCALE);
            this.canvas.width =  this.width * this.scale;
            this.canvas.height = this.height * this.scale;
            document.body.appendChild(this.canvas);
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
            context.drawImage(
                this.canvas,
                0, 0, this.canvas.width, this.canvas.height,
                x+this.x, y+this.y, this.width, this.height
            );
        },
        show: function(x,y) {
            translate(this.canvas, x+this.x, y+this.y);
            this.canvas.style.display = 'block';
        },
        hide: function() {
            this.canvas.style.display = 'none';
        }
    });
});
