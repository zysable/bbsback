module.exports = {
  apps: [
    {
      name: 'bash shell',
      exec_mode: 'cluster',
      instances: 'max',
      script: './bin/www'
    }
  ]
}
