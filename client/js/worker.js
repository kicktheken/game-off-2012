importScripts('lib/class.js');

var workers = [];
var Worker = (function() {
    var imgdata, progress, length;
    return Class.extend({
        init: function(_imgdata) {
            imgdata = _imgdata;
            length = imgdata.data.length;
            progress = 0;
        },
        work: function() {
            var goal = progress+100000000;
            while (progress < goal && progress < length) {
                imgdata.data[progress] = 80;
                imgdata.data[progress+1] = 200;
                imgdata.data[progress+2] = 20;
                imgdata.data[progress+3] = 255;
                progress+=4;
            }
        },
        ready: function() {
            return progress == length;
        },
        progress: function() {
            return progress;
        },
        length: function() {
            return length;
        },
        reset: function() {
            progress++;
        },
        getData: function() {
            return imgdata;
        }
    });
})();

onmessage = function(e) {
    //postMessage(e);
    if (e.data.action === "ready") {
        if (!workers.length) {
            return;
        }
        var w = workers[e.data.index];
        w.work();
        if (w.ready()) {
            //postMessage(w.getData().data.length);
            w.reset();
            postMessage({index:e.data.index, imgdata:w.getData()});
        } //else {
          //  postMessage("progress: "+w.progress()+" length: "+w.length());
        //}
        //(function fib(n){ return n<2?n:fib(n-1)+fib(n-2); })(42);
        return;
    }
    if (e.data.action === "init") {
        for (var i=0; i<e.data.indexes; i++) {
            workers[i] = new Worker(e.data.imgdata);
        }
    }
};

//onmessage = function(e) {
//    postMessage("derp");
//};
