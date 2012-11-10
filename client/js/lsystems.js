/**
 * This class uses L-systems (Lindenmayer system)
 * of algorithmically drawing trees
 */
define(function() {
    var _this;
    var canvas, context, width, height;
    var State = function(x,y,angle,i) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.i = i;
    };
    return Class.extend({
        init: function() {
            width = 100;
            height = 100;
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            document.body.appendChild(canvas);
            context = canvas.getContext('2d');
        },
        getCanvas: function() { return canvas; },
        draw: function() {
            context.fillStyle = 'rgba(0,0,0,0)';
            context.fillRect(0, 0, width, height);

            var axiom = "0", stack = [],
                rules = [], iterations = 8, distance = 1, angle = 22,
                state = new State(width/2,height, 0, iterations);

            var drawLine = function(s, color) {
                var rad = (s.angle - 90) * Math.PI / 180,
                    dist = distance,
                    toX = s.x + dist * Math.cos(rad),
                    toY = s.y + dist * Math.sin(rad);
                context.lineWidth = s.i - 4;
                context.strokeStyle = color;
                context.beginPath();
                context.moveTo(s.x, s.y);
                context.lineTo(toX, toY);
                context.closePath();
                context.stroke();
                s.x = toX;
                s.y = toY;
            };

            rules.push({
                draw: function(s) {},
                rule: "11-[-2+2+2]+[+3-3-3]"
            });
            rules.push({
                draw: function(s) { drawLine(s, "rgba(140, 80, 60, 0.75)"); },
                rule: "0"
            });
            rules.push({
                draw: function(s) { drawLine(s, "rgba(24, 180, 24, 0.75)"); },
                rule: "0"
            });
            rules.push({
                draw: function(s) { drawLine(s, "rgba(48, 220, 48, 0.5)"); },
                rule: "0"
            });
            //var ts = new Date().getTime();
            //context.save();
            (function iterate(axiom, depth) {
                //state.i = depth;
                for (var i=0; i<axiom.length; i++) {
                    var c = axiom.charAt(i);
                    switch(c) {
                        case "-": {
                            state.angle += angle; break;
                        } case "+": {
                            state.angle -= angle; break;
                        } case "[": {
                            stack.push(new State(state.x, state.y, state.angle, state.i));
                            break;
                        } case "]": {
                            state = stack.pop(); break;
                        } default: {
                            var r = rules[c];
                            state.i = iterations - stack.length;
                            r.draw(state);
                            if (depth > 1) {
                                iterate(r.rule, depth-1);
                            }
                        }
                    }
                }
            })(axiom, iterations);
            //context.restore();
            //console.log(new Date().getTime() - ts);
        }
    });
});

