const express = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timeSheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = $timeSheetId`, {$timeSheetId: timeSheetId}, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (timesheet) {
            next();
        } else {
            res.sendStatus(404)
        }
    });
})

timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`, (err, timesheets) => {
        if (err) {
            next(err); 
        } else {
            res.status(200).json({timesheets:timesheets})
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id)
            VALUES ($hours, $rate, $date, $employeeId)
    `, {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
    }, function (error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err, timesheet) => {
                res.status(201).json({ timesheet: timesheet })
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
        
        if (!hours || !rate || !date) {
        return res.sendStatus(400)
    }

    db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId`,
        {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: employeeId,
            $timesheetId: req.params.timesheetId
    }, function (err) {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err, timesheet) => {
                res.status(200).json({ timesheet: timesheet })
            });
        }
    });
});

module.exports = timesheetsRouter;