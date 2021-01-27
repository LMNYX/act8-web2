const utils = require(__dirname + "/utils.js");

const Routes =
{	
	"home": async (req,res)=>
	{
		res.type("text/html").code(200);
		return res.view(__dirname+"/layouts/home.ejs");
	},

	/* Static Pages */
	"error": async (err, req,res) => 
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
	"team": async (req, res)=>
	{
		res.type("text/html").code(200);
		_tempEmployees = await utils.GetWorkingEmployees(); // storing current employees
		_resignedEmployees = await utils.GetResignedEmployees(); // storing resigned employees
		return res.view(__dirname+"/layouts/team.ejs", {"employees": _tempEmployees, "resigned": _resignedEmployees});
	},
};

module.exports = Routes;