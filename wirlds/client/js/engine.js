// vim: set et ts=4 sw=4 fdm=marker:
define([
    "map",
    "painter",
    "player",
    "jobqueue",
    "cursor",
    "camera",
    "anim"
],
function Engine(Map, Painter, Player, JobQueue, Cursor, Camera, anims) {
    var _this;
    var painter, width, height, map,
        radius, save, saves = [], camera, cursor, vs, scrollevents = [], player;
    var jobqueue, ticks = 0, elapsed = 0, deceleration, maxv, initted, started;

    var Engine = Class.extend({
        init: function(sprites) {
            if (typeof _this !== 'undefined') {
                throw "Engine is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g['Engine'] = this;
            g.twidth = 60;
            g.theight = g.twidth/2;

            map = new Map();
            camera = new Camera();
            player = new Player(sprites['castle_might'], anims['castle_might']);
            painter = new Painter(player, sprites);
            jobqueue = new JobQueue(1000);
            radius = 2;
            cursor = new Cursor();
            vs = [];
            deceleration = 1;
            maxv = 30;
            initted = false;
            started = false;
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
            if (!started) {
                return;
            }
            cursor.press(x,y);
            cursor.draw();
            scrollevents = [];
        },
        cursorend: function() {
            if (!started) {
                return;
            }
            var vector = cursor.release();
            if (!vector) {
                var ma = player.getMapCoords();
                path = map.findPath(ma[0],ma[1],cursor.mx,cursor.my);
                log.info('path length: '+path.length);
                player.setDestination(path);
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
        cursormove: function(x,y, down) {
            if (!started) {
                return;
            }
            var dcoords = cursor.move(x,y);
            if (down && cursor.isDown()) {
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
                $('#loading').hide();
                $('#play').show();
            }
            var res = jobqueue.work();
            if (res === 0) {
                _this.load();
            }
            elapsed += res;
            if (ticks % 100 == 0) {
                var msg = "ticks: "+ticks+" elapsed: "+elapsed+ " "+jobqueue;
                msg += " "+camera+" "+player+" "+painter+" "+started;
                log.info(msg);
                elapsed = 0;
            }
        },
        start: function() {
            started = true;
        },
        isStarted: function() {
            return started;
        }
    });

    return Engine;
});
