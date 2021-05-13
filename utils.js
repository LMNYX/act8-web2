const { Client } = require('pg');
var config = require(__dirname + '/config.json');
const defaultConfig = require(__dirname + '/default-config.json');
const client = new Client(config.DB);
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const getColors = require('get-image-colors');
const { stderr } = require('process');
const md = require('markdown-it')();
// minification
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-es');
const cssnano = require('@node-minify/cssnano');

/*   config update   */

var _configRewriteNeeded = false;

for ( _rootKey in defaultConfig )
{
	if ( !( _rootKey in config ) )
	{
		console.warn(`[WARNING] '${_rootKey}' is missing in config, but exists in default. Copying to stay up to date...`);
		config[_rootKey] = defaultConfig[_rootKey];
		_configRewriteNeeded = true;
	}
	if ( typeof(defaultConfig[_rootKey]) == "object" )
	{
		for ( _inKey in defaultConfig[_rootKey] )
		{
			if ( !( _inKey in config[_rootKey] ) )
			{
				console.warn(`[WARNING] '${_inKey}' in '${_rootKey}' is missing in config, but exists in default. Copying to stay up to date...`);
				config[_rootKey][_inKey] = defaultConfig[_rootKey][_inKey];
				_configRewriteNeeded = true;
			}
		}
	}
}

if ( _configRewriteNeeded )
	fs.writeFileSync(__dirname + "/config.json", JSON.stringify(config, null, 2));

/* config update end */

client.connect()
.catch((e)=>{ console.log(e); });

var Utils = {};

// Var
Utils.SocialTypes = {
	"twitter.com": "Twitter",
	"github.com": "GitHub",
	"vk.com": "VK",
	"twitch.tv": "Twitch",
	"youtube.com": "YouTube",
	"reddit.com": "Reddit",
	"steamcommunity.com": "Steam",

	"act8team.com": "act8team",
};

Utils.fs = fs;

const ToMinify = [
	// + Scripts
	`${__dirname}/static/scripts/public.js`,

	// + Styles
	`${__dirname}/static/styles/public.css`
];
// Will be used to generate ${_fileName}+.min.+{_ext}

Utils.serviceName = config['env']['service'];

Utils.GetFileExt = function (fileName)
{
	_fileName = fileName.split('.');
	return { "name": _fileName[0], "ext": _fileName[_fileName.length-1] };
}

Utils.GenerateMinifiedName = function (fileName)
{
	_sep = Utils.GetFileExt(fileName);
	return `${_sep.name}.min.${ _sep.ext}`;
}

Utils.GenerateMinification = function ()
{
	ToMinify.forEach((_file)=>
	{
		_fileData = this.GetFileExt(_file);
		_minName = this.GenerateMinifiedName(_file);
		switch(_fileData.ext)
		{
			case "js":
				minify({
					compressor: uglifyjs,
					input: _file,
					output: _minName,
					callback: function (e, m){}
				});
				break;
			case "css":
				minify({
					compressor: cssnano,
					input: _file,
					output: _minName,
					callback: function (e, m){}
				});
				break;
			default:
				console.warn(`Impossible task: ${_file} can't be minified (unknown ext)`);
				break;
		}
	});
	return;
}

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
	game = await client.query("SELECT id, name, poster_logo FROM games ORDER BY id DESC;");
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

Utils.getLatestGames = async function ()
{

	_games = await client.query('SELECT id, poster_logo, name FROM games ORDER BY id DESC FETCH NEXT 3 ROWS ONLY');
	return _games.rows;

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

Utils.Execute = async function (shell_command)
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

Utils.FilterCommits = async function (_raw)
{
	await _raw.forEach(async (p, i, a)=>{
		a[i] = { message: p['message'], timestamp: p['timestamp'] };
	})
	return _raw;
}

Utils.BuildGitData = async function (_g)
{
	return {
		changesetId: _g['after'].substring(0,6),
		branch: _g['ref'].startsWith('refs/heads/') ? _g['ref'].split('/')[2] : "master",
		repo: _g['repository']['name'],
		pushTime: _g['repository']['pushed_at'],
		pusher: _g['pusher'],
		commits: await Utils.FilterCommits(_g['commits'])
	};
}

Utils.BuildCommitString = async function (_commits)
{

	_commits = Object.values(_commits);
	await _commits.forEach(async (p, i, a)=>
	{ a[i] = p['message']; });
	return _commits.join("\n");
}

Utils.GetCommitsData = async function ()
{
	_amount = await client.query('SELECT COUNT(*) FROM commits;');
	return {
		"amount": parseInt(_amount.rows[0]['count']),
		"pages_max": Math.floor(parseInt(_amount.rows[0]['count'])/10)+1
	};
}

Utils.getCommits = async function (_page, filterData)
{
	if(_page != 0)
		_offset = _page*10;
	else
		_offset = 0;
	_commits = await client.query(`SELECT * FROM COMMITS ORDER BY id DESC OFFSET ${_offset} ROWS FETCH NEXT 10 ROWS ONLY;`);
	return _commits.rows;
}

Utils.getEmployeeDataFromEmail = async function (_email)
{
	_user = await client.query(`SELECT id, full_name, avatar_url FROM employees WHERE email = $1::text;`, [_email]);
	if(_user.rows.length < 1)
		return {"full_name": `${_email.split('@')[0]}.unlinked`, 'id': -1, 'avatar_url': null};
	else
		return _user.rows[0];
}

Utils.MapEmailsToCommits = async function (_commits)
{
	for (let commit = 0; commit < _commits.length; commit++) {
		const comObj = _commits[commit];
		comObj['author'] = await this.getEmployeeDataFromEmail(comObj['pusher_email']);
	}
	return _commits;
}

Utils.PushCommitDB = async function (_d)
{
	_comm = await client.query("INSERT INTO commits (repository, push_time, changesetId, pusher_email, commit_text, branch) VALUES ($1, NOW(), $2, $3, $4, $5)", [ _d['repo'], _d['changesetId'], _d['pusher']['email'], await Utils.BuildCommitString(_d['commits']), _d['branch'] ]);
	return;
}

module.exports = Utils;