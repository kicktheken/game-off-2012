define(["sprite"],function Hud(Sprite) {
    return Sprite.extend({
        init: function(resources) {
            this._super({width:100, height: 180, backgrond:'rgba(64,64,64,.5)', z: 4});
            this.context.font = 'bold 16pt Arial';
            this.context.fillStyle = 'white';
            this.context.scale(.5,.5);
            this.resources = resources;
            for (var i in resources) {
                resources[i].count = 0;
            }
        },
        update: function() {
            this.context.clearRect(0,0,this.width*2,this.height*2);
            this.context.fillText('Remaining:',10,30);
            for (var i = 0; i < 10; i++) {
                this.resources[i].draw(this.context, 32, 32*(i+2));
                this.context.fillText(this.resources[i].count,60,32*(i+2));
            }
            this.show(0,0);
        },
        decrement: function(ri) {
        },
        increment: function(ri) {
            this.resources[ri].count++;
        }
    });
});
