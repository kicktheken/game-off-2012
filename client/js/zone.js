define(["sprite"],function Zone(Sprite) {
    return Sprite.extend({
        init: function(dsize,zx,zy) {
            this.dsize = dsize;
            this.size = dsize + 2; // to fix seaming issues
            this._super({
                width:      this.size,
                height:     this.size,
                justify:    'center',
                z:          0,
                background: 'black'
            });
            this.zx = zx;
            this.zy = zy;
            this.mapbounds = [
                Math.floor((2*zx-1)*dsize/g.twidth),
                Math.floor((2*zy-1)*dsize/g.theight),
                Math.ceil((2*zx+1)*dsize/g.twidth),
                Math.ceil((2*zy+1)*dsize/g.theight + g.spriteheight/g.theight)
            ];
            log.info(this.mapbounds);
            return;
            this.ybuffers = {};
            var maxy = this.mapbounds[3];
            for (my = this.mapbounds[1]; my < maxy; my++) {
                this.ybuffers[my] = new Sprite({
                    width:  this.size,
                    height: g.spriteheight+g.theight/2,
                    justify:'center',
                    standalone: true
                });
            }
            this.hidden = false;
            this.ready = false;
            this.iterator = null;
        },
        toString: function() {
            return 'zone('+this.zx+','+this.zy+')';
        },
        load: function() {
            if (this.ready) {
                return this.show();
            } else if (this.iterator) {
                return;
            }
            var iterator = g.Map.getZoneIterator.apply(this.map,this.mapbounds),
                dsize = this.dsize, size = this.size, zx = this.zx, zy = this.zy,
                context = this.context, _this = this;
            this.iterator = function() {
                for (var i=0; i<1000; i++) {
                    var tile = iterator();
                    if (!tile) {
                        if (g.Camera.isZoneVisible(dsize,size,zx,zy)) {
                            apply(_this,'show');
                        } else {
                            apply(_this,'hide');
                        }
                        _this.ready = true;
                        _this.iterator = null;
                        return true;
                    }
                    if (tile.isDrawable()) {
                        g.Painter.drawTile(
                            //this.ybuffers[tile.y],
                            context,
                            tile.x*g.twidth/2-dsize*zx+size/2,
                            //g.spriteheight,
                            tile.y*g.theight/2-dsize*zy+size/2,
                            tile.r
                        );
                    }
                }
                return false;
            };
            return this.iterator;
        },
        show: function() {
            g.Painter.addShown(this);
            var cpos = g.Camera.zone2cursor(this.dsize,this.zx,this.zy);
            this._super(cpos.x,cpos.y);
            this.hidden = false;
        }
    });
});
