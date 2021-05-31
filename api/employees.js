const express = require('express');
const employeeRouter = express.Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.param('id', (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`, { $employeeId: id }, (err, employee) => {
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
employeeRouter.get('/:id', (req, res, next) => {
    res.status(200).json({employee: req.employee})
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

// Updates an employee
employeeRouter.put('/:id', (req, res, next) => {
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        currentlyEmployed = req.body.employee.is_current_employee;
    
    if (!name || !position || !wage || !currentlyEmployed) {
        res.sendStatus(400)
    };

    db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $currentlyEmployed WHERE Employee.id = $employeeId`, {
        $name: name,
        $position: position,
        $wage: wage,
        $currentEmployee: currentlyEmployed,
        $employeeId: req.params.id
    }, (error) => {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.id}`, (err, employee) => {
                res.status(200).json({ employee: employee })
            });
        }
    });
});

// Sets a current employee as no-longer employed
employeeRouter.delete('/:id', (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = ${req.params.id})`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.id}`, (err, employee) => {
                res.status(200).json({ employee: employee })
            });
        }
    });
});

module.exports = employeeRouter;