// vim: set et ts=4 sw=4 fdm=marker:
define(["painter","map","jobqueue"],function(Painter, Map, JobQueue) {
    var _this;
    var $canvas, canvas, context, painters = [], bwidth, bheight,
        twidth, theight, map, radius, save, saves = [], center, mousedown;
    var resizeTimeout, worker, jobqueue, ticks = 0, elapsed = 0;

    return Class.extend({
        init: function($display) {
            _this = this;
            $canvas = $display;
            bwidth = parseInt($canvas.css("width"));
            bheight = parseInt($canvas.css("height"));
            $canvas.css("width","100%");
            $canvas.css("height","100%");
            $canvas.css("display","block");
            canvas = $canvas.get(0);
            context = canvas.getContext('2d');
            twidth = 60;
            theight = 30;
            map = new Map(bwidth/twidth, bheight/theight);
            for (var i=0; i<1; i++) {
                painters.push(new Painter(map, 0, 0, bwidth, bheight, twidth, theight));
            }
            jobqueue = new JobQueue(1000);

            //jobqueue.push(_this.load);
            radius = 2;
            mousedown = false;
            center = {x:0, y:0};
            //log.setCallback(_this.showStatus);
            //_this.generateTilesInScreen();
            //_this.save();
            _this.resize();


            //worker = new Worker("js/worker.js");
            //worker.onmessage = _this.workerResponse;
            //var imgdata = context.getImageData(0,0,50,50);
            //worker.postMessage({action:"init",indexes:1,imgdata:imgdata});

        },
        // return [startx,starty,endx,endy] in map coordinates
        getZoneCoords: function() {
            var ret = [], x = Math.floor(center.x/bwidth + .5), y = Math.floor(center.y/bheight + .5),
                modx = (center.x + bwidth/2)%bwidth, mody = (center.y +bheight/2)%bheight;
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
            //log.info("engine resize to "+width+"x"+height+" ts:"+(new Date().getTime() - g.INITTIME));

            if (g.BARSIZE > 0) {
                setTimeout(function() { scrollTo(0,1); }, 100);
            }
            //context.fillStyle = 'red';
            //context.fillRect(0, 0, width, height);
            //context.fillStyle = 'white';
            //context.fillRect(10, 10, width - 20, height - 20);
            /*if (!center) {
                center = {
                    x: (canvas.width - bwidth)/2,
                    y: (canvas.height - bheight)/2
                };
                //log.info("engine set center "+(new Date().getTime() - g.INITTIME));
            } else { // recenter
                center.x += (width - oldwidth)/2;
                center.y += (height - oldheight)/2;
            }*/
            jobqueue.push(0, _this.load);

            //_this.load();
            return true;
            //_this.generateTilesInCircle(radius);
        },
        // }}}
        // {{{ cursor
        cursorstart: function(x,y) {
            mousedown = {x:x,y:y};
            /*if (y*g.SCALE > canvas.height - g.BARSIZE) {
                log.info("trigger save...");
                saves.push(_this.saveTo());
                var sum = 0;
                _.each(saves, function(s) { sum += s.length });
                log.info("total length: "+sum);
            }*/
            //log.info("click: "+x+"x"+y, _this.showStatus);
        },
        cursorend: function() {
            mousedown = false;
        },
        cursormove: function(x,y) {
            if (mousedown) {
                var sx = mousedown.x - x,
                    sy = mousedown.y - y;
                    //context.translate(sx,sy);
                    mousedown.x = x;
                    mousedown.y = y;
                _this.scroll(sx, sy);
            }
        },
        // }}}
        translate: function(x,y) {
            context.translate(x,y);
            log.info('translate '+x+' '+y);
        },
        save: function() {
            save = bcanvas[0].toDataURL();
            var m = (save.length < 10) ? save : save.length;
            log.info("save length: "+m+" "+bcanvas[0].width+"x"+bcanvas[0].height);
        },
        saveTo: function() {
            var ret = bcanvas[0].toDataURL();
            var m = (ret.length < 10) ? ret : ret.length;
            log.info("save length: "+m+" "+bcanvas[0].width+"x"+bcanvas[0].height);
            return ret;
        },
        loadZone: function(mx,my) {
            var zone = map.loadZone(mx,my);
            if (!zone) {
                return null;
            }
            var x = mx*bwidth - center.x + (canvas.width-bwidth)/2,
                y = my*bheight - center.y + (canvas.height-bheight)/2;
            _this.drawImage(x,y,zone);
        },
        load: function() {
            var zoneCoords = _this.getZoneCoords();
            //log.info(zoneCoords, true);
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);

            for (var my=zoneCoords[1]; my<=zoneCoords[3]; my++) {
                for (var mx=zoneCoords[0]; mx<=zoneCoords[2]; mx++) {
                    var zone = map.loadZone(mx,my);
                    if (zone) {
                        var x = mx*bwidth - center.x + (canvas.width-bwidth)/2,
                            y = my*bheight - center.y + (canvas.height-bheight)/2;
                        //log.info(mx+","+my,true);
                        _this.drawImage(x,y,zone);
                    } else if (painters[0].isPaused()) {
                        //log.info("assign: "+mx+","+my,true);
                        if (map.assign(mx,my)) {
                            jobqueue.push(1, painters[0].assign, [mx,my]);
                            jobqueue.push(1, map.initZone, [mx,my]);
                            jobqueue.push(1, painters[0].generateTilesInScreen, 1000);
                            jobqueue.push(1, painters[0].save);
                            jobqueue.push(1, _this.loadZone, [mx,my]);
                        }
                    } else {
                        //log.info("nothing at: "+mx+","+my,true);
                    }
                }
            }
            //context.fillStyle = 'black';
            //context.fillRect(0, 0, canvas.width, canvas.height);
            return true;
        },
        drawImage: function(x,y,img) {
            context.drawImage(img, x, y);
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
        generateTilesInCircle: function(radius) {
            var max = Math.ceil(radius*2);
            for (var y = -max; y <= max; y++) {
                for (var x = -max+(y%2); x <= max; x+=2) {
                    var dist = Math.round(Math.sqrt(x*x+y*y));
                    if (radius+1 >= dist) {
                        var green = Math.floor((Math.random()*101)-50);
                        _this.drawTile(x,y,80,green+200,20);
                    }
                }
            }
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
});
