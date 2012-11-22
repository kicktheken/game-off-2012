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
            this.buffer = new Sprite({
                width:      this.size,
                height:     this.size,
                justify:    'center',
                z:          0,
                background: 'black',
                standalone: true
            });
            this.hidden = false;
            this.loaded = false;
            this.job = null;
            this.iterator = null;
        },
        toString: function() {
            return 'zone('+this.zx+','+this.zy+')';
        },
        forceLoad: function() {
            this.loaded = false;
            if (this.job) {
                this.resetIterator();
            }
        },
        load: function() {
            this.show();
            if (this.job || this.loaded) {
                return;
            }
            return this.getJob();
        },
        resetIterator: function() {
            this.buffer.context.clearRect(0,0,this.width,this.height);
            this.iterator = g.Map.getZoneIterator.apply(null,this.mapbounds);

        },
        getJob: function() {
            var dsize = this.dsize, size = this.size, zx = this.zx, zy = this.zy,
                context = this.buffer.context, _this = this;
            this.resetIterator();
            this.job = function() {
                for (var i=0; i<1000; i++) {
                    var tile = _this.iterator();
                    if (!tile) {
                        if (g.Camera.isZoneVisible(dsize,size,zx,zy)) {
                            _this.swapBuffer();
                            apply(_this,'show');
                        } else {
                            apply(_this,'hide');
                        }
                        _this.loaded = true;
                        _this.iterator = null;
                        _this.job = null;
                        return true;
                    }
                    if (tile.isDrawable()) {
                        g.Painter.drawTile(
                            context,
                            tile.x*g.twidth/2-dsize*zx+size/2,
                            tile.y*g.theight/2-dsize*zy+size/2,
                            tile.r
                        )
                    } else {
                        // don't count undrawn tiles
                        i--;
                    }
                    tile.addZone(_this);
                }
                return false;
            };
            return this.job;
        },
        show: function() {
            g.Painter.addShown(this);
            var cpos = g.Camera.zone2cursor(this.dsize,this.zx,this.zy);
            this._super(cpos.x,cpos.y);
            this.hidden = false;
        },
        swapBuffer: function() {
            var canvas = this.canvas, context = this.context;
            this.canvas = this.buffer.canvas;
            this.context = this.buffer.context;
            this.buffer.canvas = canvas;
            this.buffer.context = context;
            document.body.removeChild(canvas);
            document.body.appendChild(this.canvas);
        }
    });
});
