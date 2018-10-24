const environments = {
    'staging':{
        httpPort    : 3000,
        httpsPort   : 3001,
        name        : 'staging'
    },

    'production' : {
        httpPort    : 9000,
        httpsPort   : 9001,
        name        : 'production'
    }
}

const currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof(environments[currentEnv]) == 'object' ?  environments[currentEnv] : environments.staging;

module.exports = envToExport;