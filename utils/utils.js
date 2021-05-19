const path = require('path');
__dirname = path.dirname(require.main.filename);

class Utils
{
    constructor(client)
    {
        this.client = client;
    }

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