define(function Sounds() {
    var _this, sounds = [
        'coin',
        'heal',
        'nothing'
    ], audio;
    return Class.extend({
        init: function() {
            if (typeof _this !== 'undefined') {
                throw "Sounds is a singleton and cannot be initialized more than once";
            }
            var a = document.createElement("audio"), extension;
            if (a.canPlayType("audio/ogg")) {
                extension = ".ogg";
                log.info("using "+extension);
            } else if (a.canPlayType("audio/mp3")) {
                extension = ".mp3";
                log.info("using "+extension);
            } else {
                log.info("can't play sounds");
            }
            a = null;
            _this = this;
            g['Sounds'] = this;
            audio = new Object();
            for (var i in sounds) {
                audio[sounds[i]] = new Audio('audio/'+sounds[i]+extension);
            }
        },
        play: function(name) {
            try {
                audio[name].currentTime=0;
                audio[name].play();
            } catch(err) {
                log.info(err);
            }
        }
    });
});
