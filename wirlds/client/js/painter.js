define([
    "zone",
    "sprite",
    "lsystem",
    "hud"
],
function Painter(Zone, Sprite, LSystem, Hud) {
    var _this, zmap, player, rcg = [], trees, resources, hud, score,
        dsize, zonecount, tilecount, shownqueue, sprites, winscreen;
    var Painter = Class.extend({
        init: function(_player, _sprites) {
            if (typeof _this !== 'undefined') {
                throw "Painter is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g['Painter'] = this;
            player = _player;
            sprites = _sprites;
            zmap = new Object();
            dsize = (g.MOBILE) ? 160 : 320;
            shownqueue = new Object();
            zonecount = 0;
            tilecount = (g.MAPREVEAL) ? Infinity : 0;
            resources = [
                new Sprite({ img: sprites['wood'], width:32, height:32, justify:'bottom', x:0, y:6, z:1}),
                new Sprite({ img: sprites['gold'], width:32, height:32, justify:'bottom', x:-1, y:6, z: 1}),
                new Sprite({ img: sprites['sulfur'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['mercury'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['gems'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['crystal'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['crystal'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['crystal'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['crystal'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['crystal'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1}),
                new Sprite({ img: sprites['ore'], width:32, height:32, justify:'bottom', x:0, y: 6, z: 1}),
                new Sprite({ img: sprites['treasure'], width:32, height:32, justify:'bottom', x:0, y:6, z: 1})
            ];
            resources[6].hueRotate(30);
            resources[7].hueRotate(60);
            resources[8].hueRotate(120);
            resources[9].hueRotate(200);
            hud = new Hud(resources);
            winscreen = new Sprite({
                img: sprites['parchment'],
                canvas: true,
                width: 422,
                height:179,
                justify:'center',
                z:5
            });
            winscreen.canvas.style.position = 'absolute';
            winscreen.canvas.style.display = 'none';
            winscreen.context.font = 'bold 12pt Arial';
            winscreen.context.textAlign = 'center';
            winscreen.context.fillText("You've made the Branch of Nordrassil!", 211, 40);
            winscreen.context.drawImage(sprites['branch'],83,60);
            _this.initTrees();
        },
        initTrees: function() {
            var treetypes = [], times = 6;
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
            // baby pine
            treetypes.push({
                rules: [
                    "0[+2][-1][00]",
                    "0+2",
                    "0-1"
                ],
                iterations: 5,
                distance: 2.5,
                angle: 50
            });
            // dead shrub
            treetypes.push({
                rules: [
                    "[-1][++2][0][--0]",
                    "1[2][+0][-0]",
                    "[-1][+0]"
                ],
                iterations: 4,
                distance: 8,
                angle: 25
            });
            // weird shrub
            treetypes.push({
                rules: [
                    "[-1][++2][0][--0]",
                    "1[2][+0][-0]",
                    "[-1][+0]"
                ],
                iterations: 5,
                distance: 5,
                angle: 20
            });
            // dead pine
            treetypes.push({
                rules: [
                    "0[+2][-1][00]",
                    "0+2",
                    "0-1"
                ],
                iterations: 4,
                distance: 4,
                angle: 40
            });

            trees = new Array(5);
            function randomTreeSet(trees,colors) {
                var ret = [];
                for (var i=0; i<times; i++) {
                    var tree = randomIndex(trees), acolors = [], sprite;
                    for (var c in colors) {
                        acolors.push(tinycolor.analogous(colors[c])[i%6].toRgbString());
                    }
                    ret.push(new LSystem(treetypes[tree],acolors, (i%2) === 0));
                }
                return ret;
            }
            trees[0] = randomTreeSet([3,5], [hsv(30,.8,.5),hsv(30,.5,.4),hsv(30,.4,.3),hsv(30,.8,.6)]);
            trees[1] = randomTreeSet([3,4], [hsv(30,.8,.5),hsv(60,.5,.5),hsv(90,.6,.7),hsv(90,.8,.8)]);
            trees[2] = randomTreeSet([0,1,2], [hsv(25,.8,.5),hsv(80,.8,.6),hsv(90,.6,.8),hsv(100,.8,.7)]);
            trees[3] = randomTreeSet([0,1], [hsv(30,.8,.5),hsv(100,.8,.5),hsv(120,.9,.7),hsv(140,.8,.7)]);
            trees[4] = randomTreeSet([1,2], [hsv(20,.6,.5),hsv(145,.8,.6),hsv(180,.7,.9),hsl(190,.8,.9)]);
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
                        zonecount++;
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
            if (hud.update()) {
                if (!score) {
                    score = [];
                    score.push(Math.round(player.traveled));
                    score.push(tilecount);
                    score.push(Math.round(10000000/player.traveled+100*player.sight));
                }
                var center = g.Camera.screenCenter();
                winscreen.context.fillText('Traveled: '+score[0]+'  Explored: '+score[1]+'   Score: '+score[2],211,150);
                winscreen.show(center.x,center.y);
            }
            return jobs;
        },
        addShown: function(zone) {
            shownqueue[zone] = zone;
        },
        drawPlayer: function() {
            var iterator, tile, updatedZones = {}, ri;
            if (!g.MAPREVEAL) {
                iterator = g.Map.getCircleIterator(player.mx,player.my,player.sight);
                while (tile = iterator()) {
                    if (!tile.isVisible()) {
                        for (var i in tile.zones) {
                            var zone = tile.zones[i];
                            updatedZones[zone] = zone;
                        }
                        g.Camera.updateBounds(tile.x, tile.y);
                        tile.visible = true;
                        if (tile.isDrawable()) {
                            tilecount++;
                        }
                    }
                }
            }
            tile = g.Map.getTile(player.mx,player.my);
            if ((ri=tile.resource(trees.length)) !== false) {
                tile.traveled = true;
                if (ri === 11) {
                    g.Sounds.play('heal');
                    player.sight++;
                } else {
                    if (hud.decrement(ri)) {
                        g.Sounds.play('coin');
                    } else {
                        g.Sounds.play('nothing');
                    }
                }
                for (var i in tile.zones) {
                    var zone = tile.zones[i];
                    updatedZones[zone] = zone;
                }
            }
            for (var i in updatedZones) {
                updatedZones[i].forceLoad();
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
                    _this.drawTree(player.context, tile, x, y);
                }
            }
            if (flipped) {
                player.flip();
            }

        },
        drawTile: function(context,tile,x,y) {
            var i, h, ri;

            // set color
            h = tile.r*rcg.length;
            i = Math.floor(h);
            context.fillStyle = rcg[i](h-i, tile.getP(trees.length));

            // draw on context
            context.beginPath();
            context.moveTo(x, y + g.theight/2);
            context.lineTo(x + g.twidth/2, y);
            context.lineTo(x, y - g.theight/2);
            context.lineTo(x - g.twidth/2, y);
            context.closePath();
            context.stroke();
            context.fill();

            // draw stuff
            if (tile.isTree()) {
                _this.drawTree(context, tile, x, y);
            } else if (tile.isPassable() && (ri = tile.resource(trees.length)) !== false) {
                resources[ri].draw(context, x, y);
            }
        },
        drawTree: function(context, tile, x, y) {
            var p = tile.getP(trees.length), b = tile.b,
                l = trees[p] && trees[p].length, i;
            if (l) {
                i = Math.floor(b*256*256)%l;
                trees[p][i].draw(context,x,y);
            }
        },
        toString: function() {
            return 'painter('+zonecount+' zones, '+tilecount+' tiles revealed)';
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
                //case 0: return tinycolor(hsl(230,.1,(1-r)*.1+.3)).toRgbString();
                case 0: return tinycolor(hsv(30,.9,(1-r)*.1+.8)).toRgbString();
                case 1: return tinycolor(hsv(50,.7,(1-r)*.1+.8)).toRgbString();
                case 2: return tinycolor(hsv(70,.5,(1-r)*.1+.7)).toRgbString();
                case 3: return tinycolor(hsv(40,1,(1-r)*.1+.5)).toRgbString();
                case 4: return tinycolor(hsv(150,.1,(1-r)*.1+.8)).toRgbString();
                //case 6: return tinycolor(hsl(190,1,(1-r)*.1+.7)).toRgbString();
            }
        });
        var green = generateRCG(function(r,p) {
            switch(p) {
                //case 0: return tinycolor(hsl(230,.1,(1-r)*.1+.2)).toRgbString();
                case 0: return tinycolor(hsv(30,.9,(1-r)*.3+.5)).toRgbString();
                case 1: return tinycolor(hsv(50,.7,(1-r)*.2+.6)).toRgbString();
                case 2: return tinycolor(hsv(90,.8,(1-r)*.2+.5)).toRgbString();
                case 3: return tinycolor(hsv(120,.8,(1-r)*.2+.4)).toRgbString();
                case 4: return tinycolor(hsv(170,.3,(1-r)*.2+.6)).toRgbString();
                //case 6: return tinycolor(hsl(190,.8,r*.1+.8)).toRgbString();
            }
        });
        var brown = generateRCG(function(r,p) {
            switch(p) {
                //case 0: return tinycolor(hsl(230,.1,(1-r)*.1+.1)).toRgbString();
                case 0: return tinycolor(hsv(30,.9,(1-r)*.2+.3)).toRgbString();
                case 1: return tinycolor(hsv(50,.4,(1-r)*.2+.3)).toRgbString();
                case 2: return tinycolor(hsv(90,.5,(1-r)*.2+.3)).toRgbString();
                case 3: return tinycolor(hsv(120,.8,(1-r)*.1+.3)).toRgbString();
                case 4: return tinycolor(hsv(170,.5,(1-r)*.1+.6)).toRgbString();
                //case 6: return tinycolor(hsl(220,.8,(1-r)*.1+.8)).toRgbString();
            }
        });
        var white = generateRCG(function(r,p) {
            switch (p) {
                //case 0: return tinycolor(hsl(20+r*30,1,r*.1+.5)).toRgbString();
                case 0: return tinycolor(hsv(30,.8,(1-r)*.2+.1)).toRgbString();
                case 1: return tinycolor(hsv(50,.4,(1-r)*.1+.2)).toRgbString();
                case 2: return tinycolor(hsv(60,.6,(1-r)*.1+.2)).toRgbString();
                case 3: return tinycolor(hsv(40,.8,(1-r)*.1+.2)).toRgbString();
                case 4: return tinycolor(hsv(170,.6,(1-r)*.1+.5)).toRgbString();
                //case 6: return tinycolor(hsl(220,.8,(1-r)*.1+.7)).toRgbString();
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
