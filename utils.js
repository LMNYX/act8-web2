const { Client } = require('pg');
const config = require(__dirname + '/config.json');
const client = new Client(config.DB);
const fs = require('fs');
const path = require('path');
const getColors = require('get-image-colors')

client.connect()
.catch((e)=>{ console.log(e); });

var Utils = {};

Utils.GetEmployee = async function (id) // get employee out of db by their id
{
	employee = await client.query("SELECT * FROM employees WHERE id = $1::integer;", [id]);
	return employee.rows[0];
}

Utils.GetEmployees = async function () // get all employees
{
	employee = await client.query("SELECT id, full_name, avatar_url, gradient_1, gradient_2, resigned FROM employees;");
	return employee.rows;
}

Utils.GetWorkingEmployees = async function () // get all employees, who's working
{
	employees = await Utils.GetEmployees();
	employees = employees.filter(employee => !employee.resigned);
	return employees;
}

Utils.GetResignedEmployees = async function () // get all employees, who've resigned.
{
	employees = await Utils.GetEmployees();
	employees = employees.filter(employee => employee.resigned);
	return employee;
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

Utils.GetBlog = async function () // get full blog
{
	blogs = await client.query("SELECT id, title, short_description, author_id, created_at FROM blog_posts;");
	return blogs.rows;
}

Utils.GetBlogPost = async function (id) // get blog post by id
{
	blogs = await client.query("SELECT * FROM blog_posts WHERE id = $1::integer;", [id]);
	return blogs.rows[0];
}

Utils.getGradientOfImageFS = async function (file)
{
	_v = await getColors(file, {count: 2});
	_v = _v.map(color => color.hex());
	return _v;
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

module.exports = Utils;