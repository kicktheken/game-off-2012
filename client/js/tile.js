define(function Tile() {
    return Class.extend({
        init: function(simplex, x, y) {
            var r = simplex.noiseR(x,y);
            var d = simplex.noiseD(x,y);
            this.r = Math.pow((r+1)/2, 1+d);
            this.x = x;
            this.y = y;
            this.visible = false;
            this.pos = {x:x,y:y};
            this.reset();
        },
        reset: function() { // for astar
            this.f = 0;
            this.g = 0;
            this.h = 0;
            this.cost = this.isPassable();
            this.visited = false;
            this.closed = false;
            this.parent = null;
        },
        isDrawable: function() {
            return (this.x+this.y) % 2 === 0;
        },
        isPassable: function() {
            return (this.r >= .5 && this.r <= .8);
        },
        isVisible: function() {
            return this.visible;
        },
        getData: function() {
            return [this.x,this.y,this.r];
        },
        toString: function() {
            return this.x+','+this.y;
        }
    });
});

