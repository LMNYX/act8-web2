/*-----*

base.js
Summary: Base for all utility classes

*-----*/
class UtilBase
{
    static #__dirname = `${__dirname}`;

    constructor(client, additionalInfo)
    {
        this.client = client;
        if(additionalInfo)
            this.additions = additionalInfo;
    }

    static getdirname()
    {
        return this.#__dirname;
    }
}

module.exports.UtilBase = UtilBase;