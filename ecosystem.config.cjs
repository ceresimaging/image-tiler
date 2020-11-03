module.exports = {
  apps: [{
    name: 'tiler',
    script: './server.js',
    node_args: '--experimental-modules --es-module-specifier-resolution=node',
    instances: 6,
    exec_mode: 'cluster',
    max_memory_restart: '550M',
    watch: true,
    watch_delay: 1000,
    env: {
      DEGUG: "",
    },
  }]
};