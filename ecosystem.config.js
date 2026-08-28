module.exports = {
  apps: [
    {
      name: "ai-haat",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: process.env.PM2_INSTANCES || "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      listen_timeout: 50000,
      kill_timeout: 5000,
      wait_ready: true,
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
