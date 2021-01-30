const utils = require(__dirname + "/utils.js");

const Routes =
{	
	"home": async (req,res)=>
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/home.ejs");
	},

	/* Static Pages */
	"error": async (err, req,res)=> 
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/static/error.ejs");
	},

	"about": async (req,res)=>
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/static/about.ejs");
	},

	"legal": async (req,res)=>
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/static/legal.ejs");
	},

	"contact": async (req,res)=>
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/static/contact.ejs");
	},

	/* Non-Static Pages */
	"team": async (req, res)=>
	{
		res.type("text/html").code(200);
		employees = await utils.getEmployeeList(); // storing current employees
		return res.view(__dirname+"/layouts/team.ejs", {"employees": employees['working'], "resigned": employees['resigned']});
	},
	"games": async (req, res)=>
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/games.ejs");
	},

	"avatarprocessor": async (req, res)=>
	{
		res.type("image/jpeg").code(200);
		req.params.user = parseInt(req.params.user);
		_res = await utils.GetEmployee(req.params.user);
		if(_res == undefined)
				res.send("");
		else
		{
			_av = await utils.ProcessAvatar(_res.avatar_url);
			res.sendFile(_av);
		}
	}
};

module.exports = Routes;