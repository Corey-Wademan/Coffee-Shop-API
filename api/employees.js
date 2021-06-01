const express = require('express');
const employeeRouter = express.Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets');

employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`, { $employeeId: employeeId }, (err, employee) => {
        if (err) {
            next(err)
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

// Returns all employees currently employed
employeeRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (error, employees) => {
        if (error) {
            next(error)
        } else {
            res.status(200).json({employees: employees})
        }
    })
});

// Returns a specific employee by Id
employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee})
});

// Creates a new employee
employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        currentEmployee = req.body.employee.currentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }
    
    db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) 
            VALUES ( $name, $position, $wage, $currentEmployee )`, {
        $name: name,
        $position: position,
        $wage: wage,
        $currentEmployee: currentEmployee
    }, function (error) {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, employee) => {
                res.status(201).json({ employee: employee })
            });
        }
    });
});

// Updates an employee
employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        currentlyEmployed = req.body.employee.currentEmployee === 0 ? 0 : 1;
    
    if (!name || !position || !wage || !currentlyEmployed) {
        return res.sendStatus(400)
    }; 

    db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $currentlyEmployed WHERE Employee.id = $employeeId`, {
        $name: name,
        $position: position,
        $wage: wage,
        $currentlyEmployed: currentlyEmployed,
        $employeeId: req.params.employeeId
    }, (error) => {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({ employee: employee })
            });
        }
    });
});

// Sets a current employee as no-longer employed
employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = ${req.params.employeeId}`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({ employee: employee })
            });
        }
    });
});

module.exports = employeeRouter;