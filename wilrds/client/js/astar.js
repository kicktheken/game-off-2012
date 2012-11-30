// javascript-astar
// Modified from http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.
define(["binheap"], function AStar(BinaryHeap) {
    return Class.extend({
        init: function() {
            this.heuristic = this.euclidean;
            this.visitors = {};
            this.searchlimit = 10000;
        },
        addVisitor: function(visitor) {
            this.visitors[visitor] = visitor;
        },
        reset: function() {
            for (var i in this.visitors) {
                this.visitors[i].reset();
            }
            this.visitor = {};
        },
        heap: function() {
            return new BinaryHeap(function(node) {
                return node.f;
            });
        },
        search: function(start, end) {
            var openHeap = this.heap(), count = 0;

            openHeap.push(start);

            while(openHeap.size() > 0) {
                count++;

                // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
                var currentNode = openHeap.pop();

                // End case -- result has been found, return the traced path.
                if(currentNode === end) {
                    var curr = currentNode;
                    var ret = [];
                    while(curr.parent) {
                        ret.push(curr);
                        curr = curr.parent;
                    }
                    this.reset();
                    return ret.reverse();
                }

                // Normal case -- move currentNode from open to closed, process each of its neighbors.
                currentNode.closed = true;
                this.addVisitor(currentNode);

                // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
                var neighbors = this.neighbors(currentNode);

                for(var i=0, il = neighbors.length; i < il; i++) {
                    var neighbor = neighbors[i];

                    if(neighbor.closed || !neighbor.isPassable()) {
                        // Not a valid node to process, skip to next neighbor.
                        continue;
                    }

                    // The g score is the shortest distance from start to current node.
                    // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                    var gScore = currentNode.g + neighbor.cost * this.heuristic(currentNode.pos, neighbor.pos);
                    var beenVisited = neighbor.visited;

                    if(!beenVisited || gScore < neighbor.g) {
                        this.addVisitor(neighbor);

                        // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                        neighbor.visited = true;
                        neighbor.parent = currentNode;
                        neighbor.h = neighbor.h || this.heuristic(neighbor.pos, end.pos);
                        neighbor.g = gScore;
                        neighbor.f = neighbor.g + neighbor.h;

                        if (!beenVisited) {
                            // Pushing to heap will put it in proper place based on the 'f' value.
                            openHeap.push(neighbor);
                        }
                        else {
                            // Already seen the node, but since it has been rescored we need to reorder it in the heap
                            openHeap.rescoreElement(neighbor);
                        }
                    }
                }
                if (count > this.searchlimit) { // exceeded limit, bail
                    break;
                }
            }

            // No result was found - empty array signifies failure to find path.
            this.reset();
            return [];
        },
        neighbors: function(node) {
            throw "need to implement neighbors function";
        },

        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
        manhattan: function(p0, p1) {
            var dx = p1.x - p0.x,
                dy = p1.y - p0.y;
            return Math.abs(dx) + Math.abs(dy);
        },
        diagonal: function(p0, p1) {
            var dx = p1.x - p0.x,
                dy = p1.y - p0.y;
            return Math.max(Math.abs(dx), Math.abs(dy));
        },
        euclidean: function(p0, p1) {
            var dx = p1.x - p0.x,
                dy = p1.y - p0.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    });
});

