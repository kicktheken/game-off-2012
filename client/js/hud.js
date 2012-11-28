define(["sprite"],function Hud(Sprite) {
    return Sprite.extend({
        init: function(resources) {
            this._super({width:100, height: 180, z: 4});
            this.context.font = 'bold 8pt Arial';
            this.context.fillStyle = 'white';
            this.context.fillText('Remaining:',5,15);
            this.context.scale(.5,.5);
            for (var i = 0; i < 10; i++) {
                resources[i].draw(this.context, 32, 32*(i+2));
            }
        },
        update: function() {
            this.show(0,0);
        }
    });
});
