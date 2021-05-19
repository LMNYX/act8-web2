/*-----*

games.js
Summary: Connection between client and database table of Games

*-----*/
const { UtilBase } = require(`${__dirname}/base.js`);

class Games extends UtilBase
{
    async GetLatest ()
    {
        let _games = await this.client.query('SELECT id, poster_logo, name FROM games ORDER BY id DESC FETCH NEXT 3 ROWS ONLY');
        return _games.rows;

    }

    async GetAll () // get all games
    {
        let game = await this.client.query("SELECT id, name, poster_logo FROM games ORDER BY id DESC;");
        return game.rows;
    }

    async Get (id) // get game by its id from db
    {
        let game = await this.client.query("SELECT * FROM games WHERE id = $1::integer;", [id]);
        return game.rows[0];
    }
}

function ClassCreation (client)
{
    return new Games(client);
}

module.exports = ClassCreation;