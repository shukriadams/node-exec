let spawn = require('./spawn');

/**
 * User sh({ cmd : 'ls foo && rm bar'})
 */
module.exports = async function(options){
    options.args = ['-c'].concat(options.cmd);
    options.cmd = 'sh';

    return await spawn(options);
}
