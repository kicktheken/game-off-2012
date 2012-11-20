define(["engine"],function(Engine) {
    var engine, ctx, capabilities;
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
    var getparams = window.location.search.replace("?","");
    var rng = (getparams.length > 0) ? Alea(getparams) : Alea();
    Math.random = rng.fract53;
    ctx = null;

    var initApp = function() {
        //log.info("document ready");

        engine = new Engine();
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
                engine.cursormove(orig.pageX, orig.pageY);
            });

        } else {
            document.addEventListener('mousedown', function(e) {
                engine.cursorstart(e.clientX, e.clientY);
            });
            document.addEventListener('mouseup', function(e) {
                engine.cursorend();
            });

            document.addEventListener('mousemove', function (e) {
                engine.cursormove(e.clientX, e.clientY);
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
        }

        // initialize audio
        //music = new Audio('audio/music/aoe_discovery.mp3');

        // animation loop
        (function animloop() {
            window.requestAnimationFrame(animloop);
            engine.run();
        })();
    }
    $(document).ready(initApp);

});

