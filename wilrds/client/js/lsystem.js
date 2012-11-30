define(["sprite"], function LSystem(Sprite) {
    var State = function(x,y,d,angle,i) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.angle = angle;
        this.i = i;
    };
    return Sprite.extend({
        init: function(o,colors,flip) {
            this._super({
                width:  g.spritewidth,
                height: g.spriteheight,
                justify: "bottom",
                z: 1,
                scale: 2/g.BACKSCALE,
                standalone: true
            });
            this.rules = o.rules;
            this.iterations = o.iterations;
            this.distance = o.distance;
            this.angle = o.angle;
            this.colors = [];
            for (var i in colors) {
                this.colors.push(colors[i]);
            }
            if (flip) {
                this.flip();
            }
            // TODO: use color filters to reduce frequency of calling this expensive function
            // http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
            this.initLSystem();
        },
        initLSystem: function() {
            var context = this.context,
                width = this.width,
                height = this.height;
            context.clearRect(0,0,width,height);
            context.lineCap = 'round';

            var axiom = "0", stack = [], that = this,
                state = new State(width/2, height, this.distance, 0, this.iterations);
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
                                color = that.colors[c];
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
                toX = s.x + s.d * Math.cos(rad),
                toY = s.y + s.d * Math.sin(rad);
            context.lineWidth = s.i;
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

