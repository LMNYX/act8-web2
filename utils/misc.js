/*-----*

misc.js
Summary: Misc utility stuff, that can't be categorized.

*-----*/
const path = require('path');
const getColors = require('get-image-colors');
const { exec } = require("child_process");
const { stderr } = require('process');
const { UtilBase } = require(`${__dirname}/base.js`);
__dirname = path.dirname(require.main.filename);

class Misc extends UtilBase
{
    getSocialTypes()
    {
        return {
            "twitter.com": "Twitter",
            "github.com": "GitHub",
            "vk.com": "VK",
            "twitch.tv": "Twitch",
            "youtube.com": "YouTube",
            "reddit.com": "Reddit",
            "steamcommunity.com": "Steam",
        
            "act8team.com": "act8team",
        };
    }

    async getSocialType (soc)
    {
        let _n = await this.getHostnameFromRegex(soc);
        if (_n in this.getSocialTypes())
            return this.getSocialTypes()[_n];
        else
            return _n;
    }

    async getHostnameFromRegex (url)
    {
        let matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        return matches && matches[1];
    }
    
    async getGradientOfImageFS (file)
    {
        let _v = await getColors(file, {count: 2});
        _v = _v.map(color => color.hex());
        return _v;
    }
    async Execute (shell_command)
    {
        exec(shell_command, (e, stdout, stderr) =>
        {
            if(e)
            {
                console.log(e.message);
                return;
            }
            if(stderr)
            {
                console.log(stderr);
                return;
            }
            console.log(stdout);
        });
    }
}

function ClassCreation(client)
{
    return new Misc(client);
}

module.exports = ClassCreation;