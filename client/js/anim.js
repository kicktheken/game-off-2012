define(function() {
    var anims = {};
    anims['castle_might'] = {
        offset: {
            src: {x: 16, y: 0},
            dest:{x: 0, y: 4}
        },
        frame: {
            speed: 10,
            ms: 50,
            src: {w:96, h:64},
            dest: {w:64, h:64}
        },
        idle: {
            S:  {fx:0, fy:0, count:1},
            SE: {fx:1, fy:0, count:1},
            E:  {fx:2, fy:0, count:1},
            NE: {fx:3, fy:0, count:1},
            N:  {fx:4, fy:0, count:1}
        },
        moving: {
            S:  {fx:5, fy:0, count:8},
            SE: {fx:13, fy:0, count:8},
            E:  {fx:21, fy:0, count:8},
            NE: {fx:29, fy:0, count:8},
            N:  {fx:37, fy:0, count:8}
        }
    };
    anims['ship'] = {
        offset: {
            src: {x: 8, y: 0},
            dest:{x: 0, y: 12}
        },
        frame: {
            speed: 10,
            ms: 100,
            src: {w:96,h:75},
            dest:{w:70,h:70}
        },
        idle: {
            S:  {fx:0, fy:0, count:1},
            SE: {fx:9, fy:0, count:1},
            E:  {fx:18, fy:0, count:1},
            NE: {fx:0,  fy:1, count:1},
            N:  {fx:9,  fy:1, count:1}
        },
        moving: {
            S:  {fx:1, fy:0, count:8},
            SE: {fx:10, fy:0, count:8},
            E:  {fx:19, fy:0, count:8},
            NE: {fx:1, fy:1, count:8},
            N:  {fx:10, fy:1, count:8}
        }
    };
    return anims;
});
