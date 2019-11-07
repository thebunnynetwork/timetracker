var endLine = require('os').EOL;
var express = require('express');
var forge = require('node-forge');
var router = express.Router();

const { Pool } = require('pg');

const pool = new Pool({
    user: 'timetracker',
    host: '192.168.33.80',
    database: 'postgres',
    password: 'test',
    port: 5432
});

const authenticateToken = `
	SELECT u.userid,
		u.username,		
		u.admin,
		u.poweruser
		FROM timetracker.auth_tokens at
			LEFT JOIN timetracker.users u
				ON at.userid = u.userid
		WHERE at.token = $1
			AND at.active IS TRUE`;

const authenticateUser = `
	SELECT userid
		FROM timetracker.users
		WHERE username = $1
			AND password = CRYPT($2, password);`;

const changePassword = `
    UPDATE timetracker.users
        SET password = CRYPT($2, gen_salt('bf'))
        WHERE username = $1;`;

const insertToken = `
	INSERT INTO timetracker.auth_tokens (
		token,
		userid,
		expires,
		created,
        active)
		VALUES (
			$1,
			$2,
			1234,
			1234,
            true)
		RETURNING token;`;

const insertUser = `
	INSERT INTO timetracker.users (
		username,
		password,
		admin,
		poweruser)
		VALUES (
			$1,
			CRYPT($2, gen_salt('bf')),
			$3,
			$4);`;

const removeUser = `
    DELETE FROM timetracker.users
        WHERE username = $1`;

const selectUserIsAdmin = `
    SELECT u.admin AS admin,
        u.poweruser AS poweruser
        FROM timetracker.auth_tokens at
            LEFT JOIN timetracker.users u
                ON at.userid = u.userid
        WHERE at.token = $1
            AND at.active IS TRUE
        LIMIT 1;`;

const selectUserList = `
    SELECT DISTINCT u.username AS username,
        u.admin AS admin,
        u.poweruser AS poweruser
        FROM timetracker.users u;`;

var authmiddle = function(req, res, next) {
	if (req.method == "OPTIONS" || req.path == "/login" || req.path == "/") {
		next();
	} else {
		pool.query(authenticateToken, [req.headers.authorization])
			.then(dbres => {
                if (dbres.rowCount > 0) {		
                    req.userinfo = {
					    userid: dbres.rows[0].userid,
                        username: dbres.rows[0].username,
                        admin: dbres.rows[0].admin,
                        poweruser: dbres.rows[0].poweruser
                    }
                    next();
                } else {
                    res.sendStatus(403);
                }
            }).catch(e => {
                console.log(e.stack);
                res.sendStatus(403);
            });
    }
};

router.all('*', authmiddle);

router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/login', function (req, res, next) {
    return pool.query(authenticateUser, [req.body.username, req.body.password])
        .then(dbres => {
            if (dbres.rowCount > 0) {
                var date = new Date();
                var messageDigest = forge.md.sha256.create();
                messageDigest.update(req.body.username + date.getTime());
                pool.query(insertToken, [messageDigest.digest().toHex(), dbres.rows[0].userid])
                    .then(tokenres => {
                        res.send({token: tokenres.rows[0].token});
                    }).catch(e => {
                        console.log(e.stack);
                        res.sendStatus(500);
                    });
            } else {
                res.sendStatus(403);
            }
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(403);
        });
});

router.get('/logout/', function(req, res, next) {

});

var isAdmin = function(req, res, next) {
    if (req.userinfo.admin) {
        next();
    } else {
        res.sendStatus(403);
    }
}

var isPowerUser = function(req, res, next) {
    if (req.userinfo.poweruser) {
        next();
    } else {
        res.sendStatus(403);
    }
}  

router.get('/', function(req, res, next) {
    res.render('index', {title: 'Express' });
});

router.post('/users/', isAdmin, function(req, res, next) {
    console.log("Username: " + req.userinfo.username);
    console.log("IsAdmin: " + req.userinfo.admin);
    console.log("IsPowerUser: " + req.userinfo.poweruser);
    pool.query(selectUserList, [])
        .then(dbres => {
            var item = dbres.rows;
            res.send(item);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
});

router.post('/userinsert/', isAdmin, function(req, res, next) {
    pool.query(insertUser, [
        req.body.username,
        req.body.password,
        req.body.isadmin,
        req.body.ispoweruser
    ]).then(dbres => {
        pool.query(selectUserList, [])
            .then(dbres => {
                var item = dbres.rows;
                res.send(item);
            }).catch(e => {
                console.log(e.stack);
                res.sendStatus(500);
            });
    }).catch(e => {
        console.log(e.stack);
        res.sendStatus(500);
    });
});

router.post('/changepassword/', isAdmin, function(req, res, next) {
    pool.query(changePassword, [req.body.username, req.body.password])
        .then(dbres => {
            res.sendStatus(200);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
});

router.post('/removeuser/', isAdmin, function(req, res, next) {
    pool.query(removeUser, [req.body.username])
        .then(dbres => {
            pool.query(selectUserList, [])
                .then(dbres => {
                    var item = dbres.rows;
                    res.send(item);
                }).catch(e => {
                    console.log(e.stack);
                    res.sendStatus(500);
                });
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
});

router.post('/isadmin/', function(req, res, next) {
    pool.query(selectUserIsAdmin, [req.body.token])
        .then(dbres => {
            res.send({
                admin: dbres.rows[0].admin,
                poweruser: dbres.rows[0].poweruser });
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
});

// Time Tracking

router.post('/timetracking/insertsprint/', function (req, res, next) {
    InsertSprint(res, req.userinfo, req.body);
});

router.post('/timetracking/loadsprint/', function (req, res, next) {
    LoadSprint(res, req.userinfo, req.body.sprintid);
});

router.post('/timetracking/loadsprints/', function (req, res, next) {
    LoadSprints(res, req.userinfo);
});

router.post('/timetracking/loadsprintdashboard/', function (req, res, next) {
    LoadSprintDashboard(res, req.userinfo, req.body.sprintid);
});

router.post('/timetracking/updatesprint/', function (req, res, next) {
    UpdateSprint(res, req.body);
});

router.post('/timetracking/loadtasktypes/', function (req, res, next) {
    LoadTaskTypes(res);
});

router.post('/timetracking/inserttimeentry/', function (req, res, next) {
    InsertTimeEntry(res, req.body);
});

router.post('/timetracking/loadtimeentries/', function (req, res, next) {
    LoadTimeEntries(res, req.body.sprintid);
});

router.post('/timetracking/updatetimeentry/', function (req, res, next) {
    UpdateTimeEntry(res, req.body);
});

router.post('/timetracking/removetimeentry/', function (req, res, next) {
    DeleteTimeEntry(res, req.userinfo, req.body.timeentryid);
});

function InsertSprint (res, userinfo, sprint) {
    return pool.query(`
        INSERT INTO timetracker.Sprints (
            UserId,
            SprintName,
            DateRange)
            VALUES (
                $1,
                $2,
                $3);`, [
        userinfo.userid,
        sprint.sprint_name,
        sprint.date_range])
        .then(dbres => {
            LoadSprints(res, userinfo);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function LoadSprint (res, userinfo, sprintId) {
    return pool.query(`
        SELECT SprintId AS sprintid,
            SprintName AS sprint_name,
            DateRange AS date_range
            FROM timetracker.Sprints
            WHERE SprintId = $1
                AND UserId = $2;`, [
        sprintId,
        userinfo.userid])
        .then(dbres => {
            res.send({
                sprintid: dbres.rows[0].sprintid,
                sprint_name: dbres.rows[0].sprint_name,
                date_range: dbres.rows[0].date_range
            });
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function LoadSprints (res, userinfo) {
    return pool.query(`
        SELECT SprintId AS sprintid,
            SprintName AS sprint_name,
            DateRange AS date_range
            FROM timetracker.Sprints
            WHERE UserId = $1;`, [
        userinfo.userid])
        .then(dbres => {
            var item = dbres.rows;
            res.send(item);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function LoadSprintDashboard (res, userinfo, sprintId) {
    return pool.query(`
        SELECT Prefix AS prefix,
            Time AS time
            FROM timetracker.TimeEntries te
                INNER JOIN timetracker.Sprints s
                    ON te.SprintId = s.SprintId
                INNER JOIN timetracker.TaskTypes tt
                    ON te.TaskTypeId = tt.TaskTypeId
            WHERE s.SprintId = $1
                AND s.UserId = $2
            ORDER BY prefix;`, [
        sprintId,
        userinfo.userid])
        .then(dbres => {
            var item = {
                "CLN": 0, 
                "DEV": 0,
                "EXC": 0,
                "LRN": 0,
                "ORG": 0,
                "PUB": 0,
                "REL": 0,
                "SPR": 0,
                "TOT": 0,
                "PLAY": 0,
                "SLEEP": 0
            };
            dbres.rows.forEach(r => {
                var timeArray = r.time.split(':');
                var totalMinutes = (parseInt(timeArray[0]) * 60) + parseInt(timeArray[1]);
                if (r.prefix === 'CLN') {
                    item.CLN += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'DEV') {
                    item.DEV += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'EXC') {
                    item.EXC += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'LRN') {
                    item.LRN += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'ORG') {
                    item.ORG += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'PUB') {
                    item.PUB += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'REL') {
                    item.REL += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'SPR') {
                    item.SPR += totalMinutes;
                    item.TOT += totalMinutes;
                }
                else if (r.prefix === 'PLAY') {
                    item.PLAY += totalMinutes;
                }
                else if (r.prefix === 'SLEEP') {
                    item.SLEEP += totalMinutes;
                }
            });
            item.CLN = parseInt(item.CLN/60);
            item.DEV = parseInt(item.DEV/60);
            item.EXC = parseInt(item.EXC/60);
            item.LRN = parseInt(item.LRN/60);
            item.ORG = parseInt(item.ORG/60);
            item.PUB = parseInt(item.PUB/60);
            item.REL = parseInt(item.REL/60);
            item.SPR = parseInt(item.SPR/60);
            item.TOT = parseInt(item.TOT/60);
            item.PLAY = parseInt(item.PLAY/60);
            item.SLEEP = parseInt(item.SLEEP/60);
            res.send(item);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function UpdateSprint (res, sprint) {
    return pool.query(`
        UPDATE timetracker.Sprints
            SET SprintName = $1,
                DateRange = $2
            WHERE SprintId = $3;`, [
        sprint.sprint_name,
        sprint.date_range,
        sprint.sprintid])
        .then(dbres => {
            res.sendStatus(200);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function LoadTaskTypes (res) {
    return pool.query(`
        SELECT Description AS description
            FROM timetracker.TaskTypes
            ORDER BY description;`, [])
        .then(dbres => {
            var item = [];
            dbres.rows.forEach((r) => {
                item.push(r.description);
            });
            res.send(item);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function DeleteTimeEntry (res, userinfo, timeEntryId) {
    return pool.query(`
        DELETE FROM timetracker.TimeEntries te
            WHERE te.TimeEntryId = $1
                AND EXISTS (
                    SELECT TimeEntryId 
                        FROM timetracker.TimeEntries tes
                            INNER JOIN timetracker.Sprints ss
                                ON tes.SprintId = ss.SprintId
                        WHERE tes.TimeEntryId = $1
                            AND ss.UserId = $2)
            RETURNING te.SprintId;`, [
        timeEntryId,
        userinfo.userid])
        .then(dbres => {
            LoadTimeEntries(res, dbres.rows[0].sprintid); 
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function InsertTimeEntry (res, timeEntry) {
    return pool.query(`
        INSERT INTO timetracker.TimeEntries (
            SprintId,
            Day,
            Task,
            TaskTypeId,
            Description,
            Time)
            VALUES (
                $1,
                $2,
                $3,
                (SELECT TaskTypeId
                    FROM timetracker.TaskTypes
                    WHERE Description = $4),
                $5,
                $6);`, [
        timeEntry.sprintid,
        timeEntry.day,
        timeEntry.task,
        timeEntry.tasktype,
        timeEntry.description,
        timeEntry.time])
        .then(dbres => {
            LoadTimeEntries(res, timeEntry.sprintid);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function LoadTimeEntries (res, sprintId) {
    return pool.query(`
        SELECT TimeEntryId AS timeentryid,
            Day AS day,
            Task AS task,
            tt.Description AS tasktype,
            te.Description AS description,
            Time AS time
            FROM timetracker.TimeEntries te
                INNER JOIN timetracker.TaskTypes tt
                    ON te.TaskTypeId = tt.TaskTypeId
            WHERE sprintid = $1;`, [
        sprintId])
        .then(dbres => {
            var item = dbres.rows;
            res.send(item);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

function UpdateTimeEntry (res, timeEntry) {
    console.log(timeEntry.tasktype);
    return pool.query(`
        UPDATE timetracker.TimeEntries
            SET Day = $1,
                Task = $2,
                TaskTypeId = (
                    SELECT TaskTypeId
                        FROM timetracker.TaskTypes
                        WHERE Description = $3),
                Description = $4,
                Time = $5
            WHERE TimeEntryId = $6
            RETURNING SprintId;`, [
        timeEntry.day,
        timeEntry.task,
        timeEntry.tasktype,
        timeEntry.description,
        timeEntry.time,
        timeEntry.timeentryid])
        .then(dbres => {
            LoadTimeEntries(res, dbres.rows[0].sprintid);
        }).catch(e => {
            console.log(e.stack);
            res.sendStatus(500);
        });
}

// End Time Tracking

module.exports = router;