module.exports = {
  reporters: {
    console: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{ response: '*', log: '*' }]
    },
    { module: 'good-console' },
    'stdout'],
    myFileReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{ response: '*', log: '*' }]
    },
    {
      module: 'good-squeeze',
      name: 'SafeJson'
    },
    {
      module: 'good-file',
      args: ['./logs/cypher-log']
    }]
  }
};
