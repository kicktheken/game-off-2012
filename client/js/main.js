define(["jquery", "engine", "lib/simplex-noise"], function($, Engine, SimplexNoise) {
    var engine, $canvas, ctx,
        capabilities = ["canvas", "canvastext", "audio", "localstorage", "sessionstorage"];

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
    var android = /Android\s[3-9]\./i.test(navigator.userAgent), // is Android 3.0+
        apple = /Mac OS/i.test(navigator.userAgent)
    g.SCALE = (g.MOBILE) ? 2 : 1;
    g.BARSIZE = (!g.MOBILE) ? 0 : (android) ? 52 : (apple) ? ((window.navigator.standalone) ? 0 : 60) : 0;
    var getparams = window.location.search.replace("?","");
    var rng = (getparams.length > 0) ? Alea(getparams) : Alea();
    g.simplex = new SimplexNoise(rng.fract53);
    Math.random = rng.fract53;
    g.simplex.d = 32;
    g.simplex.s = Math.random();

    var initApp = function() {
        //log.info("document ready");

        $canvas = $("canvas");
        engine = new Engine($canvas);
        //$canvas = engine.getCanvas();

        $(window).resize(function() {
            engine.resize();
        });

        // old click code
        if (false && g.MOBILE) {
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

        }
        // use normal scroll on IE
        if (g.IE) {
            document.addEventListener('mousedown', function(e) {
                engine.cursorstart(e.clientX, e.clientY);
            });
            document.addEventListener('mouseup', function(e) {
                engine.cursorend();
            });

            document.addEventListener('mousemove', function (e) {
                engine.cursormove(e.clientX, e.clientY);
            });

        }

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

