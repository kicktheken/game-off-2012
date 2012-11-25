define([
    "zone",
    "sprite",
    "lsystem"
],
function Painter(Zone, Sprite, LSystem) {
    var _this, zmap, player, rcg = [], trees = [],
        dsize, count, shownqueue;
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
            count = 0;
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
                colors: [
                    tinycolor(hsv(30,.8,.5)).toRgbString(),
                    tinycolor(hsv(85,.7,.6)).toRgbString(),
                    tinycolor(hsv(120,.8,.8)).toRgbString()
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
                colors: [
                    tinycolor(hsv(30,.8,.5)).toRgbString(),
                    tinycolor(hsv(90,.8,.6)).toRgbString(),
                    tinycolor(hsv(100,.6,.7)).toRgbString(),
                    tinycolor(hsv(110,.8,.8)).toRgbString()
                ],
                iterations: 5,
                distance: 4,
                angle: 25
            });
            // baby pine
            treetypes.push({
                rules: [
                    "0[+2][-1][00]",
                    "0+2",
                    "0-1"
                ],
                colors: [
                    tinycolor(hsv(30,.8,.5)).toRgbString(),
                    tinycolor(hsv(90,.9,.6)).toRgbString(),
                    tinycolor(hsv(110,.8,.8)).toRgbString()
                ],
                iterations: 5,
                distance: 2.5,
                angle: 50
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
                        count++;
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
                if (tile.isDrawable() && tile.isTree()) {
                    var x = tile.x*g.twidth/2 - player.cx - player.x,
                        y = tile.y*g.theight/2 - player.cy - player.y;
                    trees[Math.floor(tile.b*256*256)%trees.length].draw(player.context, x, y);
                }
            }
            if (flipped) {
                player.flip();
            }

        },
        drawTile: function(context,tile,x,y) {
            var i, h;

            // set color
            h = tile.r*rcg.length;
            i = Math.floor(h);
            context.fillStyle = rcg[i](h-i, Math.floor(tile.p*7));
            //c = rcg[i](h-i);
            //context.fillStyle = "rgb("+c[0]+","+c[1]+","+c[2]+")";

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
            if (tile.isTree()) {
                trees[Math.floor(tile.b*256*256)%trees.length].draw(context, x, y);
            }
        },
        toString: function() {
            return 'painter('+count+' zones)';
        }
    });

    // initialize color generators
    (function initColor(generateRCG) {
        var blue = generateRCG(function(r,p) {
            return tinycolor(hsv(200,.9,r*.4+.5)).toRgbString();
        });
        // palettes:
        //  0: hellfire
        //  1: badlands
        //  2: desert
        //  3: grassland
        //  4: forest
        //  5: tundra
        //  6: iceland
        var yellow = generateRCG(function(r,p) {
            switch(p) {
                case 0: return tinycolor(hsl(230,.1,(1-r)*.1+.3)).toRgbString();
                case 1: return tinycolor(hsv(30,.9,(1-r)*.1+.8)).toRgbString();
                case 2: return tinycolor(hsv(50,.7,(1-r)*.1+.8)).toRgbString();
                case 3: return tinycolor(hsv(70,.5,(1-r)*.1+.7)).toRgbString();
                case 4: return tinycolor(hsv(40,1,(1-r)*.1+.5)).toRgbString();
                case 5: return tinycolor(hsv(150,.1,(1-r)*.1+.8)).toRgbString();
                case 6: return tinycolor(hsl(190,1,(1-r)*.1+.7)).toRgbString();
            }
        });
        var green = generateRCG(function(r,p) {
            switch(p) {
                case 0: return tinycolor(hsl(230,.1,(1-r)*.1+.2)).toRgbString();
                case 1: return tinycolor(hsv(30,.9,(1-r)*.3+.5)).toRgbString();
                case 2: return tinycolor(hsv(50,.7,(1-r)*.2+.6)).toRgbString();
                case 3: return tinycolor(hsv(90,.8,(1-r)*.2+.5)).toRgbString();
                case 4: return tinycolor(hsv(120,.8,(1-r)*.2+.4)).toRgbString();
                case 5: return tinycolor(hsv(170,.3,(1-r)*.3+.4)).toRgbString();
                case 6: return tinycolor(hsl(190,.8,r*.1+.8)).toRgbString();
            }
        });
        var brown = generateRCG(function(r,p) {
            switch(p) {
                case 0: return tinycolor(hsl(230,.1,(1-r)*.1+.1)).toRgbString();
                case 1: return tinycolor(hsv(30,.9,(1-r)*.2+.3)).toRgbString();
                case 2: return tinycolor(hsv(50,.4,(1-r)*.2+.3)).toRgbString();
                case 3: return tinycolor(hsv(90,.5,(1-r)*.2+.3)).toRgbString();
                case 4: return tinycolor(hsv(120,.8,(1-r)*.1+.3)).toRgbString();
                case 5: return tinycolor(hsv(150,.5,(1-r)*.1+.3)).toRgbString();
                case 6: return tinycolor(hsl(220,.8,(1-r)*.1+.8)).toRgbString();
            }
        });
        var white = generateRCG(function(r,p) {
            switch (p) {
                case 0: return tinycolor(hsl(20+r*30,1,r*.1+.5)).toRgbString();
                case 1: return tinycolor(hsv(30,.8,(1-r)*.2+.1)).toRgbString();
                case 2: return tinycolor(hsv(50,.4,(1-r)*.1+.2)).toRgbString();
                case 3: return tinycolor(hsv(60,.6,(1-r)*.1+.2)).toRgbString();
                case 4: return tinycolor(hsv(40,.8,(1-r)*.1+.2)).toRgbString();
                case 5: return tinycolor(hsv(50,.6,(1-r)*.1+.2)).toRgbString();
                case 6: return tinycolor(hsl(220,.8,(1-r)*.1+.7)).toRgbString();
            }
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
        rcg.push(brown());
        rcg.push(brown());
        rcg.push(white());
        rcg.push(white());
        rcg.push(white());
    })(function(f) {
        return (function() {
            var count = 0;
            return function() {
                var index = count;
                count++;
                return function(r,p) {
                     return f(r/count + index/count,p);
                };
            };
        })();
    });

    return Painter;
});
