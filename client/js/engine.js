// vim: set et ts=4 sw=4 fdm=marker:
define([
    "map",
    "painter",
    "player",
    "jobqueue",
    "cursor",
    "camera",
],
function Engine(Map, Painter, Player, JobQueue, Cursor, Camera) {
    var _this;
    var painter, width, height, map,
        radius, save, saves = [], camera, cursor, vs, scrollevents = [], player;
    var jobqueue, ticks = 0, elapsed = 0, deceleration, maxv, initted = false;

    var Engine = Class.extend({
        init: function() {
            if (typeof _this !== 'undefined') {
                throw "Engine is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g['Engine'] = this;
            g.twidth = 60;
            g.theight = g.twidth/2;

            map = new Map();
            camera = new Camera();
            player = new Player("img/castle_might.png");
            painter = new Painter(player);
            jobqueue = new JobQueue(1000);
            radius = 2;
            cursor = new Cursor();
            vs = [];
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
            apply(camera, 'setDimensions', $(window).width(), $(window).height());
            jobqueue.push(0, _this.load);
            return true;
        },
        // }}}
        // {{{ cursor
        cursorstart: function(x,y) {
            cursor.press(x,y);
            var ma = player.getMapCoords();
                path = map.findPath(ma[0],ma[1],cursor.mx,cursor.my);
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
            cursor.draw();
        },
        cursorover: function(x,y) {
            cursor.draw();
        },
        cursorout: function() {
            cursor.hide();
        },
        // }}}
        load: function() {
            var jobs = painter.load();
            for (var i=0; i<jobs.length; i++) {
                jobqueue.push(1, jobs[i]);
            }
            if (!cursor.isHidden()) {
                cursor.draw();
            }
            camera.updateBounds(player.mx,player.my);
            return true;
        },
        scroll: function(x,y) {
            apply(camera, 'moveCenter', x, y);
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
                var msg = "ticks: "+ticks+" elapsed: "+elapsed+ " "+jobqueue;
                msg += " "+camera+" "+player;
                log.info(msg);
                elapsed = 0;
            }
        }
    });

    return Engine;
});
