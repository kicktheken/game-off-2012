// vim: set et ts=4 sw=4 fdm=marker:
define(["painter","player","map","jobqueue"],function(Painter, Player, Map, JobQueue) {
    var _this;
    var $canvas, canvas, context, painters = [], bwidth, bheight,
        map, radius, save, saves = [], center, mousedown, vs, scrollevents = [], player;
    var resizeTimeout, worker, jobqueue, ticks = 0, elapsed = 0, deceleration, maxv, initted = false;

    var Engine = Class.extend({
        init: function($display) {
            if (typeof _this !== 'undefined') {
                throw "Engine is a singleton and cannot be initialized more than once";
            }
            _this = this;
            $canvas = $display;
            bwidth = parseInt($canvas.css("width"));
            bheight = parseInt($canvas.css("height"));
            $canvas.css("width","100%");
            $canvas.css("height","100%");
            //$canvas.css("display","block");
            canvas = $canvas.get(0);
            context = canvas.getContext('2d');
            g.twidth = 60;
            g.theight = g.twidth/2;

            // +2 to fix seaming problem
            map = new Map((bwidth+2)/g.twidth, (bheight+2)/g.theight);
            for (var i=0; i<1; i++) {
                painters.push(new Painter(map, 0, 0, bwidth, bheight));
            }
            jobqueue = new JobQueue(1000);
            player = new Player("img/castle_might.png");
            //jobqueue.push(_this.load);
            radius = 2;
            mousedown = false;
            vs = [];
            center = {x:0, y:0};
            deceleration = 2 / (g.DRAWSCALE * g.SCALE);
            maxv = 30;
            //log.setCallback(_this.showStatus);

            _this.resize();

            //worker = new Worker("js/worker.js");
            //worker.onmessage = _this.workerResponse;
            //var imgdata = context.getImageData(0,0,50,50);
            //worker.postMessage({action:"init",indexes:1,imgdata:imgdata});

        },
        // return [startx,starty,endx,endy] in map coordinates
        getZoneCoords: function() {
            var ret = [], x = Math.floor(center.x/bwidth + .5), y = Math.floor(center.y/bheight + .5),
                modx = Math.round(center.x + bwidth/2)%bwidth, mody = Math.round(center.y +bheight/2)%bheight;
            if (modx < 0) modx = bwidth + modx;
            if (mody < 0) mody = bheight + mody;
            ret.push(x-Math.ceil((canvas.width/2 - modx)/bwidth));
            ret.push(y-Math.ceil((canvas.height/2 - mody)/bheight));
            ret.push(x+Math.ceil((canvas.width/2 - bwidth + modx)/bwidth));
            ret.push(y+Math.ceil((canvas.height/2 - bheight + mody)/bheight));
            return ret;
        },
        // {{{ resize
        resize: function() {
            //clearTimeout(resizeTimeout);
            //resizeTimeout = setTimeout(_this._resize, 100);
            jobqueue.push(0, _this._resize);
        },
        _resize: function() {
            $canvas.height($(window).height() + g.BARSIZE);

            var width = $canvas.width() * g.SCALE,
                height = $canvas.height() * g.SCALE,
                oldwidth = $canvas.attr('width'),
                oldheight = $canvas.attr('height');
            if (width == oldwidth && height == oldwidth) {
                return true;
            }
            $canvas.attr('width', width);
            $canvas.attr('height', height);
            log.info("engine resize to "+width+"x"+height+" ts:"+(new Date().getTime() - g.INITTIME));

            if (g.BARSIZE > 0) {
                setTimeout(function() { scrollTo(0,1); }, 100);
            }
            jobqueue.push(0, _this.load);

            //_this.load();
            return true;
            //_this.generateTilesInCircle(radius);
        },
        // }}}
        // {{{ cursor
        cursorstart: function(x,y) {
            mousedown = {x:x,y:y,ts:g.ts()};
            scrollevents = [];
        },
        cursorend: function() {
            mousedown = false;
            var dx, dy, dt, v;
            if (vs.length === 0) {
                return;
            } else if (vs.length === 1) {
                dx = vs[0].dx;
                dy = vs[0].dy;
                dt = vs[0].dt;
            } else { // look at the last two to resolve the (backwards glitch)
                var a = anglediff(vs[0].dx,vs[0].dy,vs[1].dx,vs[1].dy),
                    i = (Math.abs(a) > Math.PI/2) ? 1 : 0;
                dx = vs[i].dx;
                dy = vs[i].dy;
                dt = vs[i].dt;
            }
            v = Math.sqrt(dx*dx+dy*dy) / dt * 1000 / 60;
            if (v > maxv) v = maxv;
            log.info(v);
            for (var k = v; k > 0; k -= deceleration) {
                scrollevents.push([k/v * dx, k/v * dy]);
            }
            jobqueue.push(0, function() {
                if (scrollevents.length === 0) {
                    return true;
                }
                var se = scrollevents.shift();
                _this.scroll(se[0],se[1]);
                return (scrollevents.length === 0) ? true : null;
            });
            vs = [];
        },
        cursormove: function(x,y) {
            if (mousedown) {
                var dx = mousedown.x - x,
                    dy = mousedown.y - y,
                    ts = g.ts();
                if (ts > mousedown.ts) {
                    vs.unshift({dx:dx,dy:dy,dt:ts-mousedown.ts});
                }
                mousedown.x = x;
                mousedown.y = y;
                mousedown.ts = ts;
                _this.scroll(dx, dy);
            }
        },
        // }}}
        translate: function(x,y) {
            context.translate(x,y);
            log.info('translate '+x+' '+y);
        },
        loadZone: function(mx,my) {
            var zone = map.loadZone(mx,my);
            if (!zone) {
                return null;
            }
            var x = mx*bwidth - Math.round(center.x) + (canvas.width)/2,
                y = my*bheight - Math.round(center.y) + (canvas.height)/2;
            _this.drawImage(x,y,zone);
        },
        load: function() {
            var zoneCoords = _this.getZoneCoords();
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);

            for (var my=zoneCoords[1]; my<=zoneCoords[3]; my++) {
                for (var mx=zoneCoords[0]; mx<=zoneCoords[2]; mx++) {
                    var zone = map.loadZone(mx,my);
                    if (zone) {
                        var x = mx*bwidth - Math.round(center.x) + (canvas.width)/2,
                            y = my*bheight - Math.round(center.y) + (canvas.height)/2;
                        _this.drawImage(x,y,zone);
                    } else if (apply(painters[0], 'isPaused')) {
                        if (map.assign(mx,my)) {
                            jobqueue.push(1, painters[0], 'assign', [mx,my]);
                            jobqueue.push(1, map.initZone, [mx,my]);
                            jobqueue.push(1, painters[0], 'generateTilesInScreen', 1000);
                            jobqueue.push(1, painters[0], 'save');
                            jobqueue.push(1, _this.loadZone, [mx,my]);
                        }
                    } else {
                        //log.info("nothing at: "+mx+","+my,true);
                    }
                }
            }
            player.draw(context, canvas.width/2-center.x, canvas.height/2-center.y);
            return true;
        },
        drawImage: function(x,y,img) {
            img.show(x,y);
            //context.drawImage(img, x, y);
            //log.info("load at "+x+" "+y);
        },
        erase: function() {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            log.info('erase');
        },
        scroll: function(x,y) {
            center.x += x;
            center.y += y;
            //jobqueue.push(0, _this.load);
            _this.load();
        },
        showStatus: function (msg) {
            var width = canvas.width, height = canvas.height;
            context.fillStyle = 'white';
            context.fillRect(10, height - 40, width - 20, 30);
            context.fillStyle = 'black';
            context.font = 'bold 12pt Arial';
            context.fillText(msg, 20, height - 20);
        },
        workerResponse: function(e) {
            if (e.data.imgdata && center) {
                context.putImageData(e.data.imgdata, 0, 0);
            } else {
                console.log(e.data);
            }
            //console.log(e.data);
        },
        run: function() {
            ticks++;
            if (!initted && jobqueue.count() === 0) {
                log.info((g.ts() - g.INITTIME) + "ms startup");
                initted = true;
            }
            var res = jobqueue.work();
            if (res === 0) {
                _this.load();
            }
            elapsed += res;
            if (ticks % 100 == 0) {
                var msg = "ticks: "+ticks+" elapsed: "+elapsed+ " count: "+jobqueue.count();
                msg += " center "+center.x+","+center.y;
                log.info(msg);
                //log.info(_this.getZoneCoords());
                //log.info(canvas.width);
                elapsed = 0;
            }
        }
    });

    // returns 0 <= x < 2*PI
    function cart2rad(x,y) {
        if (x === 0) {
            return (y === 0) ? 0 : (y > 0) ? Math.PI/2 : 3*Math.PI/2;
        }
        return (x > 0) ? Math.atan(y/x) : Math.PI+Math.atan(y/x);
    }

    // return -PI <= x < PI
    function anglediff(x1,y1,x2,y2) {
        var rad = cart2rad(x2,y2) - cart2rad(x1,y1);
        return (rad < -Math.PI) ? rad+Math.PI : (rad >= Math.PI) ? rad-Math.PI : rad;
    }

    return Engine;
});
