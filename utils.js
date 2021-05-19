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

const UtilMgr = require(`${__dirname}/utils/utils.js`)(client);
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
	employee = await client.query("SELECT id, full_name, avatar_url, gradient_1, gradient_2, resigned FROM employees ORDER BY id ASC;");
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

/* new style  */
Utils.Games = UtilMgr.Require('games');
Utils.Commits = UtilMgr.Require('commits');
Utils.Processors = UtilMgr.Require('processors');;

module.exports = Utils;