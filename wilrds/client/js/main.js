define(["engine", "preloader"],function(Engine, Preloader) {
    var engine, ctx, capabilities, sprites;
    capabilities = [
        "canvas",
        "canvastext",
        "audio",
        "localstorage",
        "sessionstorage",
        "applicationcache"
    ];

    //log.info(Modernizr);
    for (var i=0; i<capabilities.length; i++) {
        if (!Modernizr[capabilities[i]]) {
            alert("Your browser does not support "+capabilities[i]);
            //return;
        }
    }
    //var music = {};
    //music.play = function() {};


    g.ts = function() { return new Date().getTime(); };
    g.INITTIME = g.ts();

    ctx = document.createElement('canvas').getContext('2d');

    // reference from http://www.html5rocks.com/en/tutorials/canvas/hidpi/
    g.BACKSCALE = getDefault(ctx.webkitBackingStorePixelRatio, 1);
    g.SCALE = (window.devicePixelRatio) ? window.devicePixelRatio / g.BACKSCALE : 1;
    g.spritewidth = g.spriteheight = 100;
    var getparams = window.location.search.replace("?",""), seed = getparams.replace('mapreveal','');
    g.MAPREVEAL = (seed !== getparams);
    var rng = (seed.length > 0) ? Alea(seed) : Alea();
    log.info("seed: "+rng.args);
    Math.random = rng.fract53;
    ctx = null;

    var initApp = function() {
        //log.info("document ready");

        engine = new Engine(sprites);
        //$canvas = engine.getCanvas();

        $(window).resize(engine.resize);

        if (g.MOBILE) {
            $(document).bind('touchstart', function(e) {
                e.preventDefault();
                e = e.originalEvent.touches[0];
                engine.cursorstart(e.pageX, e.pageY);
            });
            $(document).bind('touchend', function(e) {
                engine.cursorend();
            });
            $(document).bind('touchmove', function(e) {
                var orig = e.originalEvent.touches[0];
                e.preventDefault();
                engine.cursormove(orig.pageX, orig.pageY, true);
            });
            $('#play').bind('touchend', function() {
                $('.loadscreen').hide();
                engine.start();
            });

        } else {
            document.addEventListener('mousedown', function(e) {
                engine.cursorstart(e.clientX, e.clientY);
            });
            document.addEventListener('mouseup', function(e) {
                engine.cursorend();
            });
            document.addEventListener('mousemove', function (e) {
                // e.which is always 1 on IE 9 despite the following docs:
                // http://msdn.microsoft.com/en-us/library/ie/ff974344(v=vs.85).aspx
                engine.cursormove(e.clientX, e.clientY, e.which);
            });
            document.addEventListener('mouseover', function (e) {
                engine.cursorover(e.clientX, e.clientY);
            });
            window.addEventListener('mouseout', function (e) {
                engine.cursorout();
            });
            window.addEventListener('blur', function (e) {
                engine.cursorout();
            });
            if (/Mac OS/i.test(navigator.userAgent)) { // trackpad scrolling is win
                var ffVersion = navigator.userAgent.match(/Firefox\/\d+/i);
                if (ffVersion) {
                    ffVersion = ffVersion[0].substring(ffVersion[0].indexOf('/')+1);
                    if (ffVersion > 16) { // deltaX only works on FF 17.0+
                        initMouseScroll();
                        window.addWheelListener(document, function(e) {
                            engine.scroll(e.deltaX,e.deltaY);
                        });
                    }
                } else if (/webkit/i.test(navigator.userAgent)) {
                    initMouseScroll();
                    window.addWheelListener(document, function(e) {
                        engine.scroll(e.deltaX*20,e.deltaY*20);
                    });
                }
            }
            $('#play').click(function() {
                $('.loadscreen').hide();
                engine.start();
            });
        }

        // initialize audio
        //music = new Audio('audio/music/aoe_discovery.mp3');

        // animation loop
        (function animloop() {
            window.requestAnimationFrame(animloop);
            engine.run();
        })();
    }
    Preloader(function(imgs) {
        sprites = imgs;
        $(document).ready(initApp);
    });
});

