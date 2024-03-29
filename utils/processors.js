/*-----*

processors.js
Summary: File and other data processors

*-----*/
const fs = require('fs');
const path = require('path');
const { UtilBase } = require(`${__dirname}/base.js`);
__dirname = path.dirname(require.main.filename);

class Processors extends UtilBase
{
	async ProcessAvatar (id)
	{
		if(fs.existsSync(path.join(__dirname, "static", "imgs", "avatars", id+".jpg")) && fs.existsSync(path.join(__dirname, "static", "imgs", "avatars", id+"_100.jpg")))
			return {"full": "/imgs/avatars/"+id+".jpg", "100px": "/imgs/avatars/"+id+"_100.jpg"}
		else
			if(new Date().getDate()+"."+(new Date().getMonth()+1) == "21.6")
				return "/imgs/default/droid.jpg";
			else
				return "/imgs/default/no-avatar.jpg";
	}
	async ProcessPoster (id)
	{
		if(fs.existsSync(path.join(__dirname, "static", "imgs", "games", id+".jpg")) && fs.existsSync(path.join(__dirname, "static", "imgs", "games", id+"_100.jpg")))
			return {"full": "/imgs/games/"+id+".jpg", "100px": "/imgs/games/"+id+"_100.jpg"}
		else
			return "/imgs/default/no-poster.jpg";
	}
}

function ClassCreation (client)
{
	return new Processors(client);
}

module.exports = ClassCreation;