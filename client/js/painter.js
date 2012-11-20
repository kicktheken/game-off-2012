define(["overlay", "sprite", "lsystem"],function(Overlay, Sprite, LSystem) {
    var _this, map, player, terrainmap, rcg = [], trees = [],
        dsize, size, shownqueue, jobs;
    var Painter = Class.extend({
        init: function(_map, _player) {
            if (typeof _this !== 'undefined') {
                throw "Painter is a singleton and cannot be initialized more than once";
            }
            _this = this;
            map = _map;
            player = _player;
            dsize = (g.MOBILE) ? 480 : 640;
            size = dsize + 2;
            shownqueue = [];

            terrainmap = new Overlay(function() {
                return new Sprite({
                    width:      size,
                    height:     size,
                    justify:    "center",
                    z:          0,
                    background: "black"
                });
            });

            var treetypes = [];
            // oak
            treetypes.push({
                rules: [
                    "0-[-2][0+1+1-]+[++1][+0-2-2]",
                    "0[-1][++2]",
                    "0[+1][--2]"
                ],
                iterations: 5,
                distance: 3,
                angle: 20
            });
            // pine
            treetypes.push({
                rules: [
                    "[++1][--1][-2][+3]0[+3][-2][0]",
                    "[-2][+3]1[+3][-2]",
                    "0",
                    "0"
                ],
                iterations: 5,
                distance: 4,
                angle: 25
            });
            for (var i=0; i<treetypes.length; i++) {
                for (var n=0; n<4; n++) {
                    trees.push(new LSystem(treetypes[i]));
                }
            }
        },
        load: function(centerx, centery, vwidth, vheight) {
            centerx = Math.floor(centerx);
            centery = Math.floor(centery);
            var x = Math.floor(centerx/dsize + .5), y = Math.floor(centery/dsize + .5),
                modx = Math.round(centerx + dsize/2)%dsize, mody = Math.round(centery +dsize/2)%dsize;
            if (modx < 0) modx = dsize + modx;
            if (mody < 0) mody = dsize + mody;
            var col = x-Math.ceil((vwidth/2 - modx)/dsize),
                row = y-Math.ceil((vheight/2 - mody)/dsize),
                maxx = x+Math.ceil((vwidth/2 - dsize + modx)/dsize),
                maxy = y+Math.ceil((vheight/2 - dsize + mody)/dsize);
            var loadedFunc = function(zone,mx,my) {
                var x = mx*dsize - Math.round(centerx) + vwidth/2,
                    y = my*dsize - Math.round(centery) + vheight/2;
                shownqueue.push(zone);
                zone.show(x,y);
            };
            var jobs = [], generateFunc = function(zone,mx,my) {
                jobs.push((function() {
                    var iterator = map.getZoneIterator(
                        Math.floor((2*mx-1)*dsize/g.twidth),
                        Math.floor((2*my-1)*dsize/g.theight),
                        Math.ceil((2*mx+1)*dsize/g.twidth),
                        Math.ceil((2*my+1)*dsize/g.theight + g.spriteheight/g.theight)
                    );
                    return function() {
                        for (var i=0; i<1000; i++) {
                            var data = iterator();
                            if (!data) {
                                zone.ready = true;
                                return function(centerx,centery,vwidth,vheight) {
                                    var x = mx*dsize - Math.round(centerx) + vwidth/2,
                                        y = my*dsize - Math.round(centery) + vheight/2;
                                    shownqueue.push(zone);
                                    zone.show(x,y);
                                };
                            }
                            if ((data[0]+data[1]) % 2 === 0) {
                                _this.drawTile.apply(_this, [zone.context,mx,my].concat(data));
                            }
                        }
                        return false;
                    };
                })());
            };
            for (var i=0; i<shownqueue.length; i++) {
                shownqueue[i].hide();
            }
            shownqueue = [];
            terrainmap.setZones(col,row,maxx,maxy,loadedFunc,generateFunc);
            player.draw(vwidth/2 - centerx, vheight/2 - centery);
            _this.drawTree(player.context, player.mx-1, player.my+1);
            _this.drawTree(player.context, player.mx+1, player.my+1);
            _this.drawTree(player.context, player.mx, player.my+2);
            _this.drawTree(player.context, player.mx-1, player.my+3);
            _this.drawTree(player.context, player.mx+1, player.my+3);
            _this.drawTree(player.context, player.mx, player.my+4);
            return jobs;
        },
        drawTree: function(context,mx,my) {
            var r = map.getTile(mx,my);
            if (r > .8) {
                var x = (mx-player.mx)*g.twidth/2 - player.x,
                    y = (my-player.my)*g.theight/2 - player.y;
                trees[Math.floor(r*256*256)%trees.length].draw(context, x, y);
            }
        },
        drawTile: function(context,mx,my,x,y,r) {
            var xpos, ypos, c, i;
            xpos = x*g.twidth/2 - dsize*mx + size/2;
            ypos = y*g.theight/2 - dsize*my + size/2;

            // set color
            var h = r*rcg.length;
            i = Math.floor(h);
            c = rcg[i](h-i);
            context.fillStyle = "rgb("+c[0]+","+c[1]+","+c[2]+")";

            // draw on context
            context.beginPath();
            context.moveTo(xpos, ypos + g.theight/2);
            context.lineTo(xpos + g.twidth/2, ypos);
            context.lineTo(xpos, ypos - g.theight/2);
            context.lineTo(xpos - g.twidth/2, ypos);
            context.closePath();
            context.stroke();
            context.fill();

            // draw tree
            if (r > .8) {
                trees[Math.floor(r*256*256)%trees.length].draw(context, xpos, ypos);
            }
        }
    });

    // initialize color generators
    (function initColor(generateRCG) {
        var blue = generateRCG(function(r) {
                var c = Math.floor(r*101) + 120;
                return [0,c-50,c];
            });
            var yellow = generateRCG(function(r) {
                var c = Math.floor((1-r)*21) + 180;
                return [c,c-20,0];
            });
            var green = generateRCG(function(r) {
                return [80, Math.floor((1-r)*81) + 120, 20];
            });
            var brown = generateRCG(function(r) {
                var c = Math.floor(r*51) + 60;
                return [c,Math.floor(c/3*2),0];
            });
            var white = generateRCG(function(r) {
                var c = Math.floor(r*51) + 200;
                return [c-40,c-20,c];
            });
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(blue());
            rcg.push(yellow());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(green());
            rcg.push(brown());
            rcg.push(brown());
            rcg.push(brown());
            rcg.push(white());
    })(function(f) {
        return (function() {
            var count = 0;
            return function() {
                var index = count;
                count++;
                return function(r) {
                     return f(r/count + index/count);
                };
            };
        })();
    });

    return Painter;
});
