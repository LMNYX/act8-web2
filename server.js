/* imports */
const fastify = require('fastify')({ logger: true })
const path = require('path');

const routes = require(__dirname + "/routes.js");

/* renderer */
fastify.register(require('point-of-view'), {
  engine: {
    eta: require('eta')
  }
})

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

/* 404 */
fastify.setNotFoundHandler(routes.error);
fastify.setErrorHandler(routes.error);

/* start listening */

fastify.listen(3000, async (err, address) => 
{
	if(err) throw err
	fastify.log.info(`Listening on ${address}`)
})