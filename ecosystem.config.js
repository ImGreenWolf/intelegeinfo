// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'node-app',
        script: 'server.js',
        instances: '1', // or a number
        exec_mode: 'fork', // enables load balancing
        watch: false
      }
    ]
  };
  
// module.exports = [{
//     script: 'server.js',
//     name: 'intelegeinfo',
//     exec_mode: 'cluster',
//     instances: 2
//   }, {
//     script: 'worker.js',
//     name: 'worker'
//   }]