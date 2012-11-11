/**
 * This class uses L-systems (Lindenmayer system)
 * of algorithmically drawing trees
 */
define(function() {
    var _this;
    var canvas, context, width, height, types, drawLine;
    var State = function(x,y,d,angle,i) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.angle = angle;
        this.i = i;
    };
    var drawLine = function(s, color) {
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
    };
    return Class.extend({
        init: function() {
            _this = this;
            width = 100;
            height = 100;
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            document.body.appendChild(canvas);
            context = canvas.getContext('2d');
            _this.initTypes();
        },
        initTypes: function() {
            types = [];
            // oak
            var type = { rules:[], iterations:5, distance:3, angle:20 };
            type.rules.push({
                draw: function(s) {
                    if (s.i === 5) {
                        drawLine(s, "rgb(140, 80, 60)");
                    } else {
                        drawLine(s, "rgb(100, 150, 24)");
                    }
                },
                rule: "0-[-2][0+1+1-]+[++1][+0-2-2]"
            });
            type.rules.push({
                draw: function(s) { drawLine(s, "rgb(24, 180, 24)"); },
                rule: "0[-1][++2]"
            });
            type.rules.push({
                draw: function(s) { drawLine(s, "rgb(48, 220, 48)"); },
                rule: "0[+1][--2]"
            });
            types.push(type);

            // pine
            type = { rules:[], iterations:5, distance:4, angle:25 };
            type.rules.push({
                draw: function(s) {
                    if (s.i === 5) {
                        drawLine(s, "rgb(140, 80, 60)");
                    } else {
                        drawLine(s, "rgb(100, 150, 24)");
                    }
                },
                rule: "[++1][--1][-2][+3]0[+3][-2][0]"
            });
            type.rules.push({
                draw: function(s) { drawLine(s, "rgb(100, 150, 24)"); },
                rule: "[-2][+3]1[+3][-2]"
            });
            type.rules.push({
                draw: function(s) { drawLine(s, "rgb(24, 180, 24)"); },
                rule: "0"
            });
            type.rules.push({
                draw: function(s) { drawLine(s, "rgb(48, 220, 48)"); },
                rule: "0"
            });
            types.push(type);
        },
        getCanvas: function() { return canvas; },
        draw: function(type) {
            context.fillStyle = 'rgba(0,0,0,0)';
            context.fillRect(0, 0, width, height);
            context.lineCap = 'round';

            type = (typeof type === 'undefined') ? types[1] : types[type];
            var axiom = "0", stack = [],
                state = new State(width/2, height, type.distance, 0, type.iterations);
            //var ts = new Date().getTime();
            //context.save();
            (function iterate(axiom, depth) {
                //state.i = depth;
                for (var i=0; i<axiom.length; i++) {
                    var c = axiom.charAt(i);
                    switch(c) {
                        case "-": {
                            state.angle += type.angle; break;
                        } case "+": {
                            state.angle -= type.angle; break;
                        } case "[": {
                            stack.push(new State(state.x, state.y, state.d, state.angle, state.i));
                            break;
                        } case "]": {
                            state = stack.pop(); break;
                        } default: {
                            var r = type.rules[c];
                            state.i = type.iterations - stack.length;
                            r.draw(state);
                            if (depth > 1) {
                                iterate(r.rule, depth-1);
                            }
                        }
                    }
                }
            })(axiom, type.iterations);
            //context.restore();
            //console.log(new Date().getTime() - ts);
        }
    });
});

