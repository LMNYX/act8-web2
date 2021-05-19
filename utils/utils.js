/*-----*

utils.js
Summary: Main manager of all utils, registerer.

*-----*/
const path = require('path');
const { UtilBase } = require(`${__dirname}/base.js`);
__dirname = path.dirname(require.main.filename);

class Utils extends UtilBase
{
    Require(util_name)
    {
        return require(`${__dirname}/utils/${util_name}.js`)(this.client);
    }
}

function ClassCreation(client)
{
    return new Utils(client);
}

module.exports = ClassCreation;