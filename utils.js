const { Client } = require('pg');
var config = require(__dirname + '/config.json');
const defaultConfig = require(__dirname + '/default-config.json');
const client = new Client(config.DB);
const fs = require('fs');
const path = require('path');
const UtilMgr = require(`${__dirname}/utils/utils.js`)(client);

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

Utils.fs = fs;
Utils.serviceName = config['env']['service'];
Utils.ToMinify = [
	// + Scripts
	`${__dirname}/static/scripts/public.js`,
	// + Styles
	`${__dirname}/static/styles/public.css`
];

/* utils methods  */
Utils.Minify = UtilMgr.Require('minify');
Utils.Misc = UtilMgr.Require('misc');
Utils.Games = UtilMgr.Require('games');
Utils.Commits = UtilMgr.Require('commits');
Utils.Employees = UtilMgr.Require('employees');
Utils.Blog = UtilMgr.Require('blog');
Utils.Processors = UtilMgr.Require('processors');

module.exports = Utils;