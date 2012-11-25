define(function Tile() {
    return Class.extend({
        init: function(simplex, x, y) {
            var r = simplex.noiseR(x,y);
            var d = simplex.noiseD(x,y);
            this.r = Math.pow((r+1)/2, 1+d);
            this.b = (simplex.noiseB(x,y)+1)/2;
            this.p = (simplex.noiseP(x,y)+1)/2;
            this.x = x;
            this.y = y;
            this.visible = getDefault(g.MAPREVEAL,false);
            this.pos = {x:x,y:y};
            this.reset();
            this.zones = new Array(4);
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
            return this.visible && (this.x+this.y) % 2 === 0;
        },
        isPassable: function() {
            return (this.r > .5 && this.r <= .6 || (this.b < .5 && this.r > .6));
        },
        isTree: function() {
            return (this.r > .6 && this.b > .5);
        },
        isVisible: function() {
            return this.visible;
        },
        getData: function() {
            return [this.x,this.y,this.r];
        },
        addZone: function(zone) { // denote a zone has visited this tile
            var i;
            for (i = 0; i < this.zones.length; i++) {
                if (this.zones[i] === zone) {
                    return;
                }
            }
            this.zones[i] = zone;
        },
        toString: function() {
            return this.x+','+this.y;
        }
    });
});

