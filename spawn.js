const 
    spawn = require('cross-spawn'),
    process = require('process');

/**
 * options: 
 * {
 *     cmd : main command to run.
 *     args : array or space-delimited string of arguments to run cmd with 
 *     options : object of options to pass directly to spawn.
 *     failOnStderr : bool. True if stderr output will be treated as errors. True by default.
 *     onEnd : optional callback for when process exits (both pass and fail)
 *     onStdout : optional callback for when stdout receives data
 *     onStderr : optional callback when the stderr receives data
 *     verbose : bool, true if results should be written to console
 * }
 */
module.exports = async function (options){
    return new Promise(function(resolve, reject){

        options.cwd = options.cwd || process.cwd();
        options.args = options.args || [];
        if (options.failOnStderr === undefined)
            options.failOnStderr = true;
        
        if (typeof options.args === 'string')
            options.args = options.args.split(' ');

        let result = '',
            error = '',
            child = spawn(options.cmd, options.args, options);

        if (options.onStart)
            options.onStart({
                pid : child.pid
            });

        // child will not have stdout if redirecting srtout
        if (child.stdout)
            child.stdout.on('data', function (data) {
                data = data.toString('utf8');
                if (options.verbose)
                    console.log(data);

                if (options.onStdout)
                    options.onStdout(data);

                result += data;
            });

        // child will not have stderr if redirecting stderr
        if (child.stderr)
            child.stderr.on('data', function (data) {
                data = data.toString('utf8');

                if (options.verbose)
                    console.log(data);

                if (options.onStderr)
                    options.onStderr(data);

                error += data;
            });
    
        child.on('error', function (err) {
            if(options.onEnd) 
                options.onEnd({
                    code : 1,
                    passed: false,
                    result: err
                });

            return reject(err);
        });
        
        child.on('close', function (code) {
            if (options.failOnStderr && error.length){
                if(options.onEnd) 
                    options.onEnd({
                        code,
                        passed: false,
                        result : error 
                    });

                return reject(error);
            }

            const out = {
                code : code,
                passed: true,
                result : result
            };

            if(options.onEnd) 
                options.onEnd(out);

            resolve(out);
        });
    })
}  
