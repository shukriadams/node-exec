let spawn = require('cross-spawn'),
    process = require('process');

/**
 * options: 
 * {
 *     cmd : main command to run.
 *     args : array or space-delimited string of arguments to run cmd with 
 *     options : object of options to pass directly to spawn.
 *     verbose : bool, true if results should be written to console
 * }
 */
module.exports = async function (options){
    return new Promise(function(resolve, reject){

        options.cwd = options.cwd || process.cwd();
        options.args = options.args || [];

        if (typeof options.args === 'string')
            options.args = options.args.split(' ');

        let result = '',
            error = '',
            child = spawn(options.cmd, options.args, options);

        child.stdout.on('data', function (data) {
            if (options.verbose)
                console.log(data.toString('utf8'));

            result += data.toString('utf8');
        });
            
        child.stderr.on('data', function (data) {
            if (options.verbose)
                console.log(data.toString('utf8'));

            error += data.toString('utf8');
        });
    
        child.on('error', function (err) {
            return reject(err);
        });
        
        child.on('close', function (code) {
            if (error.length)
                return reject(error);

            resolve( {
                code : code,
                result : result
            });
        });
    })
}  