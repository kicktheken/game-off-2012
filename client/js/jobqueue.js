/**
 * A "job" is a function that returns:
 *  true: if the job is done
 *  false: if the job is not done
 *  null: delay execution for this cycle and yield to next job
 */
define(function JobQueue() {
    var _this, queues, count, limit, deferred;
    var JobQueue = Class.extend({
        init: function(_limit) {
            if (typeof _this !== 'undefined') {
                throw "JobQueue is a singleton and cannot be initialized more than once";
            }
            _this = this;
            g['JobQueue'] = this;
            limit = _limit;
            queues = [[],[],[]];
            deferred = [[],[],[]];
            count = 0;
        },
        push: function() {
            if (count >= limit) {
                throw "Job Queue limit ("+limit+") exceeded";
            }
            // TODO shove out low priority if limit reached
            if (arguments.length < 2 || arguments[0] < 0 || arguments[0] >= queues.length) {
                return false;
            }
            var pri = arguments[0], job, start;
            if (arguments.length > 2 && typeof arguments[2] === 'string' &&
               typeof arguments[1][arguments[2]] === 'function')
            {
                job = [arguments[1], arguments[1][arguments[2]]];
                start = 3;
            } else {
                job = [null, arguments[1]];
                start = 2;
            }
            for (var i=start; i<arguments.length; i++) {
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
        },
        count: function() { return count; },
        work: function() {
            var pri, curqueue, ts = g.ts(), elapsed;
            do {
                for (pri=0; pri<queues.length; pri++) {
                    if (queues[pri].length > 0) {
                        curqueue = queues[pri];
                        break;
                    }
                }
                if (pri === queues.length) {
                    requeueDeferred();
                    return 0;
                }

                var job = curqueue[0];
                var hasArgs = (job.length > 2 && job[2] instanceof Array);
                var ret = job[1].apply(job[0],(hasArgs) ? job[2] : []);
                if (ret === null) {
                    deferred[pri].push(curqueue.shift());
                } else if (ret !== false) {
                    curqueue.shift();
                    count--;
                }
            } while ((elapsed = (g.ts()-ts)) <= 10);
            requeueDeferred();
            return elapsed;
        },
        toString: function() {
            return 'jobqueue('+[queues[0].length,queues[1].length,queues[2].length]+')';
        }
    });

    function requeueDeferred() {
        for (var pri=0; pri<deferred.length; pri++) {
            var queue = deferred[pri];
            while (queue.length > 0) {
                queues[pri].push(queue.shift());
            }
        }
    }

    return JobQueue;
});
