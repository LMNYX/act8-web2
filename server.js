/* imports */
const fastify = require('fastify')({ logger: false })
const path = require('path');
const fs = require('fs');
var config;
try
{
  config = require(__dirname + '/config.json');
} catch (e)
{
  fs.copyFile('default-config.json', 'config.json', ()=>{});
  config = require(__dirname + '/config.json');
}

const routes = require(__dirname + "/routes.js");

/* registers */
fastify.register(require('point-of-view'), { // renderer
  engine: {
    eta: require('eta')
  }
})
fastify.register(require('fastify-compress')); // compressor
fastify.register(require('fastify-multipart'))

/* static */

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'static'),
  prefix: '/',
})

/* routes */

fastify.get('/', routes.home);
fastify.get('/about', routes.about);
fastify.get('/legal', routes.legal);
fastify.get('/support', routes.contact);

fastify.get('/team', routes.team);
fastify.get('/games', routes.games);
fastify.get('/blog', routes.bloglisting);
fastify.get('/blog/:page_id', routes.bloglisting);
fastify.get('/blog/post/:post_id', routes.blogpost);
fastify.get('/dev/:dev_id', routes.devpage);
fastify.get('/game/:game_id', routes.game);

fastify.get('/avatar/:user', routes.avatarprocessor);
fastify.get('/poster/:game', routes.posterprocessor);

fastify.get('/commits', routes.commits);
fastify.get('/commits/:page_id', routes.commits);

/* GitHub */
fastify.post('/git-commit-listener', routes.gitCommitListener);
fastify.post('/git-commit-accepter', routes.githubCommitAccepter);

/* 404 */
fastify.setNotFoundHandler(routes.error);
fastify.setErrorHandler(routes.error);

/* start listening */

fastify.listen(config['http']['port'], async (err, address) => 
{
	if(err) throw err
})