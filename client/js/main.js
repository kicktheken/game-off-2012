define(["jquery", "engine", "lib/simplex-noise"], function($, Engine, SimplexNoise) {
    var engine, $canvas, ctx,
        capabilities = ["canvas", "canvastext", "audio", "localstorage", "sessionstorage", "webworkers"];

    //log.info(Modernizr);
    for (var i=0; i<capabilities.length; i++) {
        if (!Modernizr[capabilities[i]]) {
            alert("Your browser does not support HTML5 "+capabilities[i]);
            //return;
        }
    }
    //var music = {};
    //music.play = function() {};


    g.ts = function() { return new Date().getTime(); }
    g.INITTIME = g.ts();
    var android = navigator.userAgent.match(/Android\s[3-9]\./i), // is Android 3.0+
        apple = navigator.userAgent.match(/Mac OS/i);
    g.SCALE = (g.MOBILE) ? 2 : 1;
    g.BARSIZE = (!g.MOBILE) ? 0 : (android) ? 52 : (apple) ? ((window.navigator.standalone) ? 0 : 60) : 0;
    var getparams = window.location.search.replace("?","");
    var rng = (getparams.length > 0) ? Alea(getparams) : Alea();
    g.simplex = new SimplexNoise(rng.fract53);
    Math.random = rng.fract53;
    g.simplex.d = 128;
    g.simplex.s = Math.random();

    var initApp = function() {
        //log.info("document ready");

        $canvas = $("canvas");
        engine = new Engine($canvas);
        //$canvas = engine.getCanvas();

        $(window).resize(function() {
            engine.resize();
        });

        var moved = function (settings) {
            engine.scroll(settings.scrollLeft, settings.scrollTop);
        };
        $canvas.kinetic({ moved: moved });

        /*
        if (g.MOBILE) {
            $canvas.bind('touchstart', function(e) {
                e = e.originalEvent.touches[0];
                engine.cursorstart(e.pageX, e.pageY);
            });
            $canvas.bind('touchend', function(e) {
                engine.cursorend();
            });
            $canvas.bind('touchmove', function(e) {
                var orig = e.originalEvent.touches[0];
                if (orig.pageY > g.BARSIZE) {
                    e.preventDefault();
                }
                engine.cursormove(orig.pageX, orig.pageY);
            });

        } //else {
            document.addEventListener('mousedown', function(e) {
                engine.cursorstart(e.clientX, e.clientY);
            });
            document.addEventListener('mouseup', function(e) {
                engine.cursorend();
            });

            document.addEventListener('mousemove', function (e) {
                engine.cursormove(e.clientX, e.clientY);
            });

        //}
        */
        //$canvas.mousemove(function(e) {
        //    console.log(e);
        //});
        $(document).keydown(function(e){
            if (e.keyCode == 37) { // left
                engine.scroll(10,0);
            } else if (e.keyCode == 38) { // up
                engine.scroll(0,10);
            } else if (e.keyCode == 39) { // right
                engine.scroll(-10,0);
            } else if (e.keyCode == 40) { // down
                engine.scroll(0,-10);
            } else if (e.keyCode == 13) { // enter
                //$canvas.hide();
                //$swap.show();
                engine.erase();
            }
        });

        // initialize audio
        //music = new Audio('audio/music/aoe_discovery.mp3');

        // animation loop
        (function animloop() {
            requestAnimFrame(animloop);
            engine.run();
        })();
    }
    $(document).ready(initApp);

});

