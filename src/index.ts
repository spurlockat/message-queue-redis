//         ________
//        / \\\\\\\\
//       / # \\\\\\\\
//      ( * > )REDIS))
//       \ O /QUEUE//
//        \_////////

import { Queue, Worker, QueueEvents, Job } from 'bullmq'
import chalk from 'chalk'

//Init queue-events logging
const queueEvents = new QueueEvents('queue-one')

//Create queue, connect to Redis
const Q = new Queue('queue-one', { 
  connection: { 
    port: 6379, 
    host: '127.0.0.1'
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000
    }
  }
})

const worker = new Worker("queue-one", async job => {
  // What will the worker do when processing is complete?
  console.log(job.data)
})

//Listen to all worker-events in a given client
queueEvents.on('waiting', ({ jobId }) => {
  console.log(`Job with id ${jobId} waiting in the queue...`)
})
queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job with id ${jobId} ${chalk.green('COMPLETED')}, returned as ${chalk.blue(returnvalue)}`)
})
queueEvents.on('active', ({ jobId, prev }) => {
  console.log(`Job with id ${jobId} is now ${chalk.yellow('active')}, previous status was ${chalk.yellow(prev)}`)
})
queueEvents.on('progress', ({ jobId, data }, timestamp) => {
  console.log(`${jobId} reported progress ${data} at ${timestamp}`)
})
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log(`Job tagged ID ${jobId} ${chalk.red('FAILED')} with err: ${failedReason}`)
})

async function JobGroupOne() {
  await Q.add('Job1', {
    test_payload_01: {
      "name" : { "first" : "Hendrix", "last" : "Jimmie" },
      "code" : "314000000X",
      "isPrimary" : true
    },
    test_payload_02: {
      "name" : { "first" : "Bonk", "last" : "Donk" },
      "code" : "348000000X",
      "isPrimary" : false,
      "desc" : "Home"
    }
  })
}

await JobGroupOne()



