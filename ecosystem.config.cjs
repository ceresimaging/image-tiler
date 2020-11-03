module.exports = {
  apps: [{
    name: 'tiler',
    script: './server.js',
    node_args: '--experimental-modules --es-module-specifier-resolution=node',
    instances: 3,
    exec_mode: 'cluster',
    max_memory_restart: '2000M',
    watch: true,
    watch_delay: 1000,
    env: {
      DEGUG: "",
    },
  }]
};