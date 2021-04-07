const { Client } = require('pg');
const config = require(__dirname + '/config.json');
const client = new Client(config.DB);
const fs = require('fs');
const path = require('path');
const getColors = require('get-image-colors')
const md = require('markdown-it')();

client.connect()
.catch((e)=>{ console.log(e); });

var Utils = {};

// Var
Utils.SocialTypes = {
	"twitter.com": "Twitter",
};

Utils.GetEmployee = async function (id) // get employee out of db by their id
{
	employee = await client.query("SELECT * FROM employees WHERE id = $1::integer;", [id]);
	return employee.rows[0];
}
Utils.GetLiteEmployee = async function (id) // get employee out of db by their id
{
	employee = await client.query("SELECT id, full_name FROM employees WHERE id = $1::integer;", [id]);
	return employee.rows[0];
}

Utils.GetEmployees = async function () // get all employees
{
	employee = await client.query("SELECT id, full_name, avatar_url, gradient_1, gradient_2, resigned FROM employees;");
	return employee.rows;
}

Utils.GetWorkingEmployees = async function (employees) // get all employees, who's working
{
	employees = employees.filter(employee => !employee.resigned);
	return employees;
}

Utils.GetResignedEmployees = async function (employees) // get all employees, who've resigned.
{
	employees = employees.filter(employee => employee.resigned);
	return employees;
}

Utils.getEmployeeList = async function()
{
	_empReturn = {};
	_employees = await Utils.GetEmployees();
	_empReturn['working'] = await Utils.GetWorkingEmployees(_employees);
	_empReturn['resigned'] = await Utils.GetResignedEmployees(_employees);
	return _empReturn;
}

Utils.GetGames = async function () // get all games
{
	game = await client.query("SELECT id, name, poster_logo FROM games;");
	return game.rows;
}

Utils.GetGame = async function (id) // get game by its id from db
{
	game = await client.query("SELECT * FROM games WHERE id = $1::integer;", [id]);
	return game.rows[0];
}

Utils.MapAuthor = async function (blogposts)
{
	for (var i = blogposts.length - 1; i >= 0; i--) {
		blogposts[i]['author'] = await Utils.GetLiteEmployee(blogposts[i]['author_id']);
	}
	return blogposts;
}

Utils.MapAuthorSingular = async function (blogpost)
{
	blogpost['author'] = await Utils.GetLiteEmployee(blogpost['author_id']);
	return blogpost;
}

Utils.ParseMarkdown = async function (mkd)
{
	return await md.render(mkd);
}

Utils.GetBlogData = async function()
{

	blogs = await client.query("SELECT COUNT(*) FROM blog_posts;");
	return {"posts": blogs.rows[0]['count'], "pages_max": Math.floor(blogs.rows[0]["count"]/5), "pages_min": 0};

}

Utils.GetBlog = async function (_pageID) // get full blog
{
	if (_pageID == 0)
		_offset = 0;
	else
		_offset = _pageID*5;
	blogs = await client.query("SELECT id, title, short_description, poster, author_id, created_at FROM blog_posts ORDER BY created_at DESC OFFSET "+_offset+" ROWS FETCH NEXT 5 ROWS ONLY;");
	return await Utils.MapAuthor(blogs.rows);
}

Utils.GetBlogPost = async function (id) // get blog post by id
{
	blogs = await client.query("SELECT * FROM blog_posts WHERE id = $1::integer;", [id]);
	return await Utils.MapAuthorSingular(blogs.rows[0]);
}

/* https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string */
Utils.getHostnameFromRegex = (url) => {
	const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	return matches && matches[1];
  }

Utils.getGradientOfImageFS = async function (file)
{
	_v = await getColors(file, {count: 2});
	_v = _v.map(color => color.hex());
	return _v;
}

Utils.getSocialType = function (soc)
{
	let _n = Utils.getHostnameFromRegex(soc);
	if (_n in Utils.SocialTypes)
		return Utils.SocialTypes[_n];
	else
		return _n;
}

Utils.ProcessAvatar = async function (id)
{
	if(fs.existsSync(path.join(__dirname, "static", "imgs", "avatars", id+".jpg")) && fs.existsSync(path.join(__dirname, "static", "imgs", "avatars", id+"_100.jpg")))
		return {"full": "/imgs/avatars/"+id+".jpg", "100px": "/imgs/avatars/"+id+"_100.jpg"}
	else
		if(new Date().getDate()+"."+(new Date().getMonth()+1) == "21.6")
			return "/imgs/default/droid.jpg";
		else
			return "/imgs/default/no-avatar.jpg";
}
Utils.ProcessPoster = async function (id)
{
	if(fs.existsSync(path.join(__dirname, "static", "imgs", "games", id+".jpg")) && fs.existsSync(path.join(__dirname, "static", "imgs", "games", id+"_100.jpg")))
		return {"full": "/imgs/games/"+id+".jpg", "100px": "/imgs/games/"+id+"_100.jpg"}
	else
		return "/imgs/default/no-poster.jpg";
}

module.exports = Utils;