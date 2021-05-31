const express = require('express');
const employeeRouter = express.Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

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

// Creates a new employee
employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        currentEmployee = req.body.employee.is_current_employee;
    if (!name || !position || !wage || !currentEmployee) {
        return res.sendStatus(404);
    }
    
    db.run(`INSERT INTO Employee (
        name, position, wage, is_current_employee
    ) VALUES (
        $name, $position, $wage, $currentEmployee
    )`, {
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

module.exports = employeeRouter;