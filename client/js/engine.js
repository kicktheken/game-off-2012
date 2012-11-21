// vim: set et ts=4 sw=4 fdm=marker:
define([
    "map",
    "painter",
    "player",
    "jobqueue",
    "cursor"
],
function Engine(Map, Painter, Player, JobQueue, Cursor) {
    var _this;
    var painter, width, height, map,
        radius, save, saves = [], center, cursor, vs, scrollevents = [], player;
    var jobqueue, ticks = 0, elapsed = 0, deceleration, maxv, initted = false;

    var Engine = Class.extend({
        init: function() {
            if (typeof _this !== 'undefined') {
                throw "Engine is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g.twidth = 60;
            g.theight = g.twidth/2;

            map = new Map();
            player = new Player("img/castle_might.png");
            painter = new Painter(map, player);
            jobqueue = new JobQueue(1000);
            //jobqueue.push(_this.load);
            radius = 2;
            cursor = new Cursor(map);
            vs = [];
            center = {x:0, y:0};
            deceleration = 1;
            maxv = 30;
            //log.setCallback(_this.showStatus);

            /*$(document).keypress(function(e) {
                switch (e.charCode) {
                    case 105: player.mx--; player.my--; break; //i
                    case 106: player.mx--; player.my++; break; //j
                    case 107: player.mx++; player.my++; break; //k
                    case 108: player.mx++; player.my--; break; //l
                }
            });*/
            _this.resize();
        },
        // {{{ resize
        resize: function() {
            width = $(window).width();
            height = $(window).height();
            document.body.style.width = width;
            document.body.style.height = height;
            log.info("engine resize to "+width+"x"+height+" ts:"+(g.ts() - g.INITTIME));

            jobqueue.push(0, _this.load);
            return true;
        },
        // }}}
        // {{{ cursor
        cursorstart: function(x,y) {
            cursor.press(x,y);
            var path = map.findPath(player.mx,player.my,cursor.mx,cursor.my);
            log.info('path length: '+path.length);
            player.setDestination(path);
            scrollevents = [];
        },
        cursorend: function() {
            var vector = cursor.release();
            if (!vector) {
                return;
            }
            for (var k = vector[0]; k > 0; k -= deceleration) {
                scrollevents.push([k/vector[0] * vector[1], k/vector[0] * vector[2]]);
            }
            jobqueue.push(0, function() {
                if (scrollevents.length === 0) {
                    return true;
                }
                var se = scrollevents.shift();
                _this.scroll(se[0],se[1]);
                return (scrollevents.length === 0) ? true : null;
            });
        },
        cursormove: function(x,y) {
            var dcoords = cursor.move(x,y);
            if (cursor.isDown()) {
                _this.scroll(dcoords[0], dcoords[1]);
            }
            cursor.draw(center.x,center.y,width,height);
        },
        cursorover: function(x,y) {
            cursor.draw(center.x,center.y,width,height);
        },
        cursorout: function() {
            cursor.hide();
        },
        // }}}
        load: function() {
            var jobs = painter.load(center.x, center.y, width, height);
            for (var i=0; i<jobs.length; i++) {
                jobqueue.push(1, function(job) {
                    var ret = job();
                    if (ret) {
                        ret(center.x, center.y, width, height);
                        return true;
                    }
                    return false;
                }, [jobs[i]]);
            }
            if (!cursor.isHidden()) {
                cursor.draw(center.x,center.y,width,height);
            }
            return true;
        },
        scroll: function(x,y) {
            center.x += x;
            center.y += y;
            cursor.hide();
            jobqueue.push(0, _this.load);
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
                msg += " center "+[center.x,+center.y];
                log.info(msg);
                elapsed = 0;
            }
        }
    });

    return Engine;
});
