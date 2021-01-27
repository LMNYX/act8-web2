const { Client } = require('pg');
const config = require(__dirname + '/config.json');
const client = new Client(config.DB);

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
	employee = await client.query("SELECT id, full_name, avatar_url FROM employees;");
	return employee.rows;
}

Utils.GetWorkingEmployees = async function () // get all employees, who's working
{
	employee = await client.query("SELECT id, full_name, avatar_url FROM employees WHERE resigned = false;");
	return employee.rows;
}

Utils.GetResignedEmployees = async function () // get all employees, who've resigned.
{
	employee = await client.query("SELECT id, full_name, avatar_url FROM employees WHERE resigned = true;");
	return employee.rows;
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

module.exports = Utils;