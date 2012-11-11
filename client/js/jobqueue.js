/**
 * A "job" is a function or a chain of functions that returns:
 *  true: if the job is done
 *  false: if the job is not done
 *  null: delay execution for this cycle and yield to next job
 */
define(function() {
    var JobQueue = (function() {
        var _this, queues, count, limit, deferred;
        function JobQueue(_limit) {
            _this = this;
            limit = _limit;
            queues = [[],[],[]];
            deferred = [[],[],[]];
            count = 0;
        }
        JobQueue.prototype.push = function() {
            if (count >= limit) {
                throw "Job Queue limit ("+limit+") exceeded";
            }
            // TODO shove out low priority if limit reached
            if (arguments.length < 2 || arguments[0] < 0 ||
                arguments[0] >= queues.length || typeof arguments[1] !== "function")
            {
                return false;
            }
            var pri = arguments[0],
                job = [arguments[1]]; // check later is only of instanceof Array
            for (var i=2; i<arguments.length; i++) {
                var arg = arguments[i];
                if (typeof arg === "function" || arg instanceof Array) {
                    job.push(arguments[i]);
                } else {
                    job.push([arguments[i]]);
                }
            }
            queues[pri].push(job);
            count++;
            return true;
        };
        JobQueue.prototype.blocker = function() {
            if (arguments.length < 1 || typeof arguments[0] !== "function") {
                return false;
            }
            var job = [arguments[0]]; // check later is only of instanceof Array
            for (var i=1; i<arguments.length; i++) {
                var arg = arguments[i];
                if (typeof arg === "function" || arg instanceof Array) {
                    job.push(arguments[i]);
                } else {
                    job.push([arguments[i]]);
                }
            }
            queues[0].unshift(job);
            count++;
            return true;

        };
        JobQueue.prototype.count = function() { return count; };
        JobQueue.prototype.work = function() {
            var pri, curqueue, ts = g.ts(), elapsed;
            do {
                for (pri=0; pri<queues.length; pri++) {
                    if (queues[pri].length > 0) {
                        curqueue = queues[pri];
                        break;
                    }
                }
                if (pri === queues.length) {
                    _this.requeueDeferred();
                    return 0;
                }

                var job = curqueue[0];
                var hasArgs = (job.length > 1 && job[1] instanceof Array);
                var ret = job[0].apply(null,(hasArgs) ? job[1] : []);
                if (ret === null) {
                    deferred[pri].push(curqueue.shift());
                } else if (ret !== false) {
                    job.shift();
                    if (hasArgs) job.shift();
                    if (job.length > 1) {
                        if (typeof job[1] === "function") {
                            job.splice(1,0,[ret]);
                        } else if (job[1] instanceof Array) {
                            job[1].concat(ret);
                        } else {
                            throw "non Array non Function detected in jobqueue";
                        }
                    } else {
                        curqueue.shift();
                        count--;
                    }
                }
            } while ((elapsed = (g.ts()-ts)) <= 10);
            _this.requeueDeferred();
            return elapsed;
        };
        JobQueue.prototype.requeueDeferred = function() {
            for (var pri=0; pri<deferred.length; pri++) {
                var queue = deferred[pri];
                while (queue.length > 0) {
                    queues[pri].push(queue.shift());
                }
            }
        };
        return JobQueue;
    })();

    return JobQueue;
});
