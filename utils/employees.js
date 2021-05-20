/*-----*

employees.js
Summary: Manager connecting the server and database table containing employee data.

*-----*/
const path = require('path');
const { UtilBase } = require(`${__dirname}/base.js`);
__dirname = path.dirname(require.main.filename);

class Employees extends UtilBase
{

    async Get (id) // get employee out of db by their id
    {
        let employee = await this.client.query("SELECT * FROM employees WHERE id = $1::integer;", [id]);
        return employee.rows[0];
    }
    async GetLite (id) // get employee out of db by their id
    {
        let employee = await this.client.query("SELECT id, full_name FROM employees WHERE id = $1::integer;", [id]);
        return employee.rows[0];
    }

    async GetAll () // get all employees
    {
        let employee = await this.client.query("SELECT id, full_name, avatar_url, gradient_1, gradient_2, resigned FROM employees ORDER BY id ASC;");
        return employee.rows;
    }

    async GetWorking (_employees) // get all employees, who's working
    {
        _employees = _employees.filter(employee => !employee.resigned);
        return _employees;
    }

    async GetResigned (_employees) // get all employees, who've resigned.
    {
        _employees = _employees.filter(employee => employee.resigned);
        return _employees;
    }

    async GetList ()
    {
        let _empReturn = {};
        let _employees = await this.GetAll();
        _empReturn['working'] = await this.GetWorking(_employees);
        _empReturn['resigned'] = await this.GetResigned(_employees);
        return _empReturn;
    }

}

function ClassCreation(client)
{
    return new Employees(client);
}

module.exports = ClassCreation;