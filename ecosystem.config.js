module.exports = {
    apps: [
        {
            name: 'ranking-api',
            script: 'npm',
            args: 'run start:server',
            cwd: './', // Root
            env: {
                NODE_ENV: 'production',
                PORT: 3333,
                // Add other env vars here or load from .env
            },
            error_file: './logs/api-error.log',
            out_file: './logs/api-out.log',
        },
        {
            name: 'ranking-web',
            script: 'npm',
            args: 'start',
            cwd: './web', // Inside web folder
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            error_file: './logs/web-error.log',
            out_file: './logs/web-out.log',
        },
        {
            name: 'ranking-jobs',
            script: 'npm',
            args: 'run start:jobs', // Scheduler
            cwd: './',
            env: {
                NODE_ENV: 'production',
            },
            error_file: './logs/jobs-error.log',
            out_file: './logs/jobs-out.log',
        }
    ],
};
