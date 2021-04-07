/* imports */
const fastify = require('fastify')({ logger: true })
const path = require('path');

const routes = require(__dirname + "/routes.js");

/* registers */
fastify.register(require('point-of-view'), { // renderer
  engine: {
    eta: require('eta')
  }
})
fastify.register(require('fastify-compress')); // compressor

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

/* 404 */
fastify.setNotFoundHandler(routes.error);
fastify.setErrorHandler(routes.error);

/* start listening */

fastify.listen(3000, async (err, address) => 
{
	if(err) throw err
	fastify.log.info(`Listening on ${address}`)
})