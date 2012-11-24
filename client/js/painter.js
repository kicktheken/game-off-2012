define([
    "zone",
    "sprite",
    "lsystem"
],
function Painter(Zone, Sprite, LSystem) {
    var _this, zmap, player, rcg = [], trees = [],
        dsize, shownqueue;
    var Painter = Class.extend({
        init: function(_player) {
            if (typeof _this !== 'undefined') {
                throw "Painter is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g['Painter'] = this;
            player = _player;
            zmap = new Object();
            dsize = (g.MOBILE) ? 480 : 640;
            shownqueue = new Object();
            _this.initTrees();
        },
        initTrees: function() {
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
        load: function() {
            var jobs = [], bounds = g.Camera.getZoneBounds(dsize);
            for (var i in shownqueue) {
                shownqueue[i].hidden = true;
            }
            for (var zy = bounds.row; zy <= bounds.maxy; zy++) {
                for (var zx = bounds.col; zx <= bounds.maxx; zx++) {
                    if (zmap[zy] === undefined) {
                        zmap[zy] = new Object();
                    }
                    var zone = zmap[zy][zx];
                    if (zone === undefined) {
                        zone = new Zone(dsize,zx,zy);
                        zmap[zy][zx] = zone;
                    }
                    var job = zone.load();
                    if (job) {
                        jobs.push(job);
                    }
                }
            }
            for (var i in shownqueue) {
                if (shownqueue[i].hidden) {
                    shownqueue[i].hide();
                    delete shownqueue[i];
                }
            }
            _this.drawPlayer();
            return jobs;
        },
        addShown: function(zone) {
            shownqueue[zone] = zone;
        },
        drawPlayer: function() {
            var iterator, tile;
            if (!g.MAPREVEAL) {
                var updatedZones = {};
                iterator = g.Map.getCircleIterator(player.mx,player.my,player.sight);
                while (tile = iterator()) {
                    if (!tile.isVisible()) {
                        for (var i in tile.zones) {
                            var zone = tile.zones[i];
                            updatedZones[zone] = zone;
                        }
                        g.Camera.updateBounds(tile.x, tile.y);
                        tile.visible = true;
                    }
                }
                for (var i in updatedZones) {
                    updatedZones[i].forceLoad();
                }
            }
            var cpos = g.Camera.cursorCenter();
            player.draw(cpos.x, cpos.y);
            iterator = g.Map.getZoneIterator(
                Math.floor((player.cx-g.spritewidth/2)/g.twidth*2),
                Math.floor(player.cy/g.theight*2),
                Math.ceil((player.cx+g.spritewidth/2)/g.twidth*2),
                Math.ceil((player.cy+g.spriteheight)/g.theight*2)
            );
            var flipped = player.flipped;
            if (flipped) {
                player.flip();
            }
            while (tile = iterator()) {
                if (tile.isDrawable() && tile.r > .8) {
                    var x = tile.x*g.twidth/2 - player.cx - player.x,
                        y = tile.y*g.theight/2 - player.cy - player.y;
                    trees[Math.floor(tile.r*256*256)%trees.length].draw(player.context, x, y);
                }
            }
            if (flipped) {
                player.flip();
            }

        },
        drawTile: function(context,x,y,r) {
            var c, i, h;

            // set color
            h = r*rcg.length;
            i = Math.floor(h);
            c = rcg[i](h-i);
            context.fillStyle = "rgb("+c[0]+","+c[1]+","+c[2]+")";

            // draw on context
            context.beginPath();
            context.moveTo(x, y + g.theight/2);
            context.lineTo(x + g.twidth/2, y);
            context.lineTo(x, y - g.theight/2);
            context.lineTo(x - g.twidth/2, y);
            context.closePath();
            context.stroke();
            context.fill();

            // draw tree
            if (r > .8) {
                trees[Math.floor(r*256*256)%trees.length].draw(context, x, y);
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
