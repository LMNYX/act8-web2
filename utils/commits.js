/*-----*

commits.js
Summary: Connection between client and server of Git commits

*-----*/
class Commits
{
    constructor (client)
    {
        this.client = client;
    }

    async Filter (_raw)
    {
        await _raw.forEach(async (p, i, a)=>{
            a[i] = { message: p['message'], timestamp: p['timestamp'] };
        })
        return _raw;
    }

    async BuildGitData (_g)
    {
        return {
            changesetId: _g['after'].substring(0,6),
            branch: _g['ref'].startsWith('refs/heads/') ? _g['ref'].split('/')[2] : "master",
            repo: _g['repository']['name'],
            pushTime: _g['repository']['pushed_at'],
            pusher: _g['pusher'],
            commits: await this.Filter(_g['commits' ])
        };
    }

    async BuildString (_commits)
    {

        _commits = Object.values(_commits);
        await _commits.forEach(async (p, i, a)=>
        { a[i] = p['message']; });
        return _commits.join("\n");
    }

    async GetData ()
    {
        let _amount = await this.client.query('SELECT COUNT(*) FROM commits;');
        
        return {
            "amount": parseInt(_amount.rows[0]['count']),
            "pages_max": Math.floor(parseInt(_amount.rows[0]['count'])/10)+1
        };
    }

    async Get (_page, filterData)
    {
        let _offset;
        if(_page != 0)
            _offset = _page*10;
        else
            _offset = 0;
        let _commits = await this.client.query(`SELECT * FROM commits ORDER BY id DESC OFFSET ${_offset} ROWS FETCH NEXT 10 ROWS ONLY;`);
        return _commits.rows;
    }

    async getEmployeeByEmail (_email)
    {
        let _user = await this.client.query(`SELECT id, full_name, avatar_url FROM employees WHERE email = $1::text;`, [_email]);
        if(_user.rows.length < 1)
            return {"full_name": `${_email.split('@')[0]}.unlinked`, 'id': -1, 'avatar_url': null};
        else
            return _user.rows[0];
    }

    async MapEmails (_commits)
    {
        for (let commit = 0; commit < _commits.length; commit++) {
            const comObj = _commits[commit];
            comObj['author'] = await this.getEmployeeByEmail(comObj['pusher_email']);
        }
        return _commits;
    }

    async PushDB (_d)
    {
        let _comm = await this.client.query("INSERT INTO commits (repository, push_time, changesetId, pusher_email, commit_text, branch) VALUES ($1, NOW(), $2, $3, $4, $5)", [ _d['repo'], _d['changesetId'], _d['pusher']['email'], await this.BuildString(_d['commits' ]), _d['branch'] ]);
        return;
    }
}

function CommitClassCreation(client)
{
    return new Commits(client);
}

module.exports = CommitClassCreation;