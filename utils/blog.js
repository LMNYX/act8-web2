/*-----*

blog.js
Summary: Manager connecting database table of blog posts and server.

*-----*/
const path = require('path');
const md = require('markdown-it')();
const { UtilBase } = require(`${__dirname}/base.js`);
__dirname = path.dirname(require.main.filename);

class Blog extends UtilBase
{

	constructor (client)
	{
		super(client, {
			"employees": require(`${UtilBase.getdirname()}/employees.js`)(client)
		});
	}

	async GetPage (_pageID) // get full blog
	{
		let _offset;
		if (_pageID == 0)
			_offset = 0;
		else
			_offset = _pageID*5;
		let blogs = await this.client.query("SELECT id, title, short_description, poster, author_id, created_at FROM blog_posts ORDER BY created_at DESC OFFSET "+_offset+" ROWS FETCH NEXT 5 ROWS ONLY;");
		return await this.MapAuthor(blogs.rows);
	}

	async GetPost (id) // get blog post by id
	{
		let blogs = await this.client.query("SELECT * FROM blog_posts WHERE id = $1::integer;", [id]);
		return await this.MapAuthorSingular(blogs.rows[0]);
	}

	async MapAuthor (blogposts)
	{
		for (var i = blogposts.length - 1; i >= 0; i--) {
			blogposts[i]['author'] = await this.additions.employees.GetLite(blogposts[i]['author_id']);
		}
		return blogposts;
	}

	async MapAuthorSingular (blogpost)
	{
		blogpost['author'] = await this.additions.employees.GetLite(blogpost['author_id']);
		return blogpost;
	}

	async ParseMarkdown (mkd)
	{
		return await md.render(mkd);
	}

	async GetData()
	{

		let blogs = await this.client.query("SELECT COUNT(*) FROM blog_posts;");
		return {"posts": blogs.rows[0]['count'], "pages_max": Math.floor(blogs.rows[0]["count"]/5), "pages_min": 0};

	}

}

function ClassCreation(client)
{
    return new Blog(client);
}

module.exports = ClassCreation;