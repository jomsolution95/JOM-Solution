module.exports = {
    apps: [{
        name: 'jom-backend',
        script: 'dist/main.js',
        instances: 'max', // Use all available CPUs
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
        },
        env_production: {
            NODE_ENV: 'production',
        }
    }]
};
