var kue = require('kue'),
    async = require('async'),
    queue = kue.createQueue(),
    log = console.log,
    jobs = [
      {
        type: "gmail sync",
        data: {
          title: "Gmail sync"
        }
      },
      {
        type: "cleanup",
        data: {
          title: "Clean old activities"
        }
      },
      {
        type: "deadlines",
        data: {
          title: "Process deadlines"
        }
      },
      {
        type: "Print",
        data: {
          title: "Print some data..."
        }
      },
      {
        type: "Some other work",
        data: {
          title: "Some other background work"
        }
      }
    ];

//startup
async.waterfall([
  //remove stuck jobs if process has stopped unexpectedly.
  removeStuckActiveJobs,
  //Start queued jobs.
  processAllQueuedJobs,
  //Simulate jobs insertion
  simulateJobsCreation,
])

//Debugging
queue.on("job enqueue", function (id, type){
  printJobStatusOfType();
});

//start the UI
kue.app.listen(3000);
log('UI started on port 3000');



function removeStuckActiveJobs (done) {
  queue.active(function (err, jobIds) {
    log("processStuckActiveJobs", jobIds);
    if (!err && Array.isArray(jobIds)) {
      async.each(jobIds, function (jobId, callback) {
        kue.Job.remove(jobId, function () {
          callback();
        });
      }, done);
    }
  });
}

function processAllQueuedJobs (callback) {
  async.each(jobs, function (job, done) {
    queue.process(job.type, doSomeWork);
    done();
  }, callback);
}

function simulateJobsCreation (callback) {
  create();
  callback();
}

function create() {
  var j = jobs[Math.random() * jobs.length | 0];
  var job = queue.create(j.type, j.data);
  job.save();
  setTimeout(create, Math.random() * 5e3 | 0); //jobs creation frequency
}

function printJobStatusOfType () {
  var result = '';
  async.waterfall([
    function (next) {
      queue.inactiveCount(function(err, count){
        result += 'inactiveCount:' + count + '\n';
        next();
      });
    },
    function (next) {
      queue.activeCount(function(err, count){
        result += 'activeCount: ' + count + '\n';
        next();
      });
    },
    function (next) {
      queue.failedCount(function(err, count){
        result += 'failedCount: ' + count + '\n';
        next();
      });
    },
    function (next) {
      queue.completeCount(function(err, count){
        result += 'completeCount: ' + count + '\n';
        next();
      });
    },
    function (next) {
      queue.delayedCount(function(err, count){
        result += 'delayedCount: ' + count + '\n';
        next();
      });
    }
  ], function () {
    log(result);
  })
}

//Test job
function doSomeWork (job, done) {
  var frames = Math.random() * 2000 | 0;

  function next(i) {
    convertFrame(i, function (err) {
      if (err) return done(err);
      job.progress(i, frames);
      if (i >= frames){
        done(null, {frames: frames});
      } else {
        if (!(Math.random() * 5e2 | 0)) { //Errors triggering frequency
          done(new Error("Test error"));
        } else {
          next(i + Math.random() * 10);
        }
      }
    });
  }

  function convertFrame(i, fn) {
    setTimeout(fn, Math.random() * 100); //job duration
  }
  next(0);
}
