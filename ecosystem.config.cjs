module.exports = {
  apps: [
    {
      name: "tiler",
      script: "./server.js",
      node_args: "--experimental-modules --es-module-specifier-resolution=node",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "500M",
      watch: true,
      watch_delay: 1000,
      env: {
        DEGUG: "",
        NODE_ENV: "production",
      },
    },
  ],
};
