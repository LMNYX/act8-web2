
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