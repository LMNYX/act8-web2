const utils = require(__dirname + "/utils.js");

utils.Minify.GenerateMinification(utils.ToMinify);

const Routes =
{	
	"home": async (req,res)=>
	{
		res.type("text/html").code(200);
		_latestGames = await utils.Games.GetLatest();
		return res.view(__dirname+"/layouts/home.ejs", {"latestGames": _latestGames});
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
		employees = await utils.Employees.GetList(); // storing current employees
		return res.view(__dirname+"/layouts/team.ejs", {"employees": employees['working'], "resigned": employees['resigned']});
	},
	"games": async (req, res)=>
	{
		res.type("text/html").code(200);
		_games = await utils.Games.GetAll();
		return res.view(__dirname+"/layouts/games.ejs", { "games": _games });
	},
	"bloglisting": async (req, res)=>
	{
		res.type("text/html").code(200);
		if(req.params.page_id == undefined || req.params.page_id.length < 1)
			_pageID = 0;
		else
			_pageID = req.params.page_id;
		_blog = await utils.Blog.GetPage(_pageID);
		_blogData = await utils.Blog.GetData();
		return res.view(__dirname+"/layouts/blog.ejs", { "posts": _blog, "page": parseInt(_pageID)+1, "blogData": _blogData });
	},
	"blogpost": async (req, res)=>
	{
		res.type("text/html").code(200);
		_blog = await utils.Blog.GetPost(req.params.post_id);
		return res.view(__dirname+"/layouts/blogpost.ejs", { "postData": _blog });
	},
	"game": async ( req, res ) =>
	{
		res.type("text/html").code(200);
		_game = await utils.Games.Get(req.params.game_id);
		return res.view(__dirname + "/layouts/game.ejs", {"game": _game});
	},
	"devpage": async (req, res)=>
	{
		res.type("text/html").code(200);
		_employee = await utils.Employees.Get(req.params.dev_id);
		return res.view(__dirname+"/layouts/devpage.ejs", { "devData": _employee, "getSocialType": utils.Misc.getSocialType});
	},
	
	"commits": async (req, res) =>
	{
		res.type('text/html').code(200);
		if(req.params.page_id == undefined || req.params.page_id.length < 1)
			_pageID = 0;
		else
			_pageID = req.params.page_id;
		commitsData = await utils.Commits.GetData();

		if(_pageID < 0)
		{ //Fucking idiots
			res.type('you_are_not_supposed_to/be_here/////////get_away/you_are_making-things_way_worse--please_get-lost').code(200);
			res.header("Hello-Dear", "Hello, fellow network traveller! You're thinking you are very smart by doing this, but we are way smarter :sunglasses:");
			res.send(`You think you're smart, huh?`);
			return;
		}
		
		if(commitsData.pages_max-1 < _pageID)
			_pageID = commitsData.pages_max - 1;
		pageData = await utils.Commits.Get(_pageID);
		pageData2 = await utils.Commits.MapEmails(pageData);
		return res.view(__dirname + "/layouts/commits.ejs",
		{ 
			"commitsData": commitsData,
			"pageData": pageData,
			"page": _pageID
		});
	},

	/* Processors */
	"avatarprocessor": async (req, res)=>
	{
		res.type("image/jpeg").code(200);
		req.params.user = parseInt(req.params.user);
		_res = await utils.Employees.Get(req.params.user);
		if(_res == undefined)
				res.send("");
		else
		{
			_av = await utils.Processors.ProcessAvatar(_res.avatar_url);
			res.sendFile(_av);
		}
	},

	"posterprocessor": async (req, res)=>
	{
		res.type("image/jpeg").code(200);
		req.params.game = parseInt(req.params.game);
		_res = await utils.Games.Get(req.params.game);
		if(_res == undefined)
			res.send("");
		else
		{
			_av = await utils.Processors.ProcessPoster(_res.poster_logo);
			res.sendFile(_av['100px'] == null ? _av : _av['100px']);
		}
	},

	"gitCommitListener": async (req, res)=>
	{
		res.type("application/json").code(200);

		await utils.Misc.Execute("cd "+__dirname+" && git reset --hard && git pull origin indev && service "+`${utils.serviceName} restart`);
		res.send("{\"result\": \"ok\"}");
	},
	"githubCommitAccepter": async (req, res)=>
	{
		res.type("application/json").code(200);
		if ( !("x-github-delivery" in req.headers) ) // non-github data will be declined.
			return;
		if(req.body.commits.length < 1)
		{
			res.send("{\"result\": \"denied\"}");
			return;
		}
		_gitData = await utils.Commits.BuildGitData(req.body);

		await utils.Commits.PushDB(_gitData);
		res.send("{\"result\": \"ok\"}");
	}
};

module.exports = Routes;