define(["sprite"],function Hud(Sprite) {
    return Sprite.extend({
        init: function(resources) {
            this._super({width:100, height: 200, z: 4});
            this.context.font = 'bold 16pt Arial';
            this.context.fillStyle = 'white';
            this.context.scale(.5,.5);
            this.resources = resources;
            resources[0].count = 20;
            resources[1].count = 5;
            resources[2].count = 5;
            resources[3].count = 5;
            resources[4].count = 2;
            resources[5].count = 1;
            resources[6].count = 1;
            resources[7].count = 1;
            resources[8].count = 1;
            resources[9].count = 1;
        },
        update: function() {
            this.context.clearRect(0,0,this.width*2,this.height*2);
            this.context.fillText('Remaining:',10,30);
            var i = 0, length = 10;
            for (var ri in this.resources) {
                if (i >= length) {
                    break;
                }
                if (this.resources[ri].count <= 0) {
                    length--;
                    continue;
                }
                this.resources[ri].draw(this.context, 32, 32*(i+2));
                this.context.fillText(this.resources[ri].count,60,32*(i+2));
                i++;
            }
            this.show(0,0);
            return (length <= 0);
        },
        decrement: function(ri) {
            if (ri === 10) {
                var r = Math.random();
                if (r < .5) {
                    var i = Math.floor(r*18);
                    return (--this.resources[i+1].count >= 0);
                }
                return false;
            }
            return (--this.resources[ri].count >= 0);
        },
        increment: function(ri) {
            this.resources[ri].count++;
        }
    });
});
