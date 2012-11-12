define(["sprite"], function(Sprite) {
    var State = function(x,y,d,angle,i) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.angle = angle;
        this.i = i;
    };
    return Sprite.extend({
        init: function(o) {
            this._super();
            this.rules = o.rules;
            this.iterations = o.iterations;
            this.distance = o.distance;
            this.angle = o.angle;
            this.colors = ["rgb(140, 80, 60)", "rgb(100, 150, 24)", "rgb(24, 180, 24)", "rgb(48, 220, 48)"];
            this.initLSystem();
        },
        initLSystem: function() {
            var context = this.context,
                width = this.canvas.width,
                height = this.canvas.height;
            context.fillStyle = 'rgba(0,0,0,0)';
            context.fillRect(0, 0, width, height);
            context.lineCap = 'round';

            var axiom = "0", stack = [], that = this,
                state = new State(width/2, height - g.theight/2, this.distance, 0, this.iterations);
            //var ts = new Date().getTime();
            //context.save();
            (function iterate(axiom, depth) {
                //state.i = depth;
                for (var i=0; i<axiom.length; i++) {
                    var c = axiom.charAt(i);
                    switch(c) {
                        case "-": {
                            state.angle += that.angle; break;
                        } case "+": {
                            state.angle -= that.angle; break;
                        } case "[": {
                            stack.push(new State(state.x, state.y, state.d, state.angle, state.i));
                            break;
                        } case "]": {
                            state = stack.pop(); break;
                        } default: {
                            state.i = that.iterations - stack.length;
                            var color;
                            if (c == 0) {
                                color = that.colors[(stack.length > 0) ? 1 : 0];
                            } else {
                                color = that.colors[parseInt(c)+4-that.rules.length];
                            }
                            that.drawLine(state, that.context, color);
                            if (depth > 1) {
                                iterate(that.rules[c], depth-1);
                            }
                        }
                    }
                }
            })(axiom, this.iterations);
            //context.restore();
            //console.log(new Date().getTime() - ts);
        },
        drawLine: function(s, context, color) {
            var rad = (s.angle - 90) * Math.PI / 180,
                toX = s.x + s.d * Math.cos(rad) * g.DRAWSCALE,
                toY = s.y + s.d * Math.sin(rad) * g.DRAWSCALE;
            context.lineWidth = s.i * g.DRAWSCALE;
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(s.x, s.y);
            context.lineTo(toX, toY);
            context.closePath();
            context.stroke();
            s.x = toX;
            s.y = toY;
        }
    });
});

