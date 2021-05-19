/*----

processors.js
Summary: Processing data into file paths.

-----*/
const fs = require('fs');
const path = require('path');
__dirname = path.dirname(require.main.filename);

var Processors = {};

Processors.ProcessAvatar = async function (id)
{
    console.log(__dirname);
	if(fs.existsSync(path.join(__dirname, "static", "imgs", "avatars", id+".jpg")) && fs.existsSync(path.join(__dirname, "static", "imgs", "avatars", id+"_100.jpg")))
		return {"full": "/imgs/avatars/"+id+".jpg", "100px": "/imgs/avatars/"+id+"_100.jpg"}
	else
		if(new Date().getDate()+"."+(new Date().getMonth()+1) == "21.6")
			return "/imgs/default/droid.jpg";
		else
			return "/imgs/default/no-avatar.jpg";
}
Processors.ProcessPoster = async function (id)
{
	if(fs.existsSync(path.join(__dirname, "static", "imgs", "games", id+".jpg")) && fs.existsSync(path.join(__dirname, "static", "imgs", "games", id+"_100.jpg")))
		return {"full": "/imgs/games/"+id+".jpg", "100px": "/imgs/games/"+id+"_100.jpg"}
	else
		return "/imgs/default/no-poster.jpg";
}


module.exports = Processors;