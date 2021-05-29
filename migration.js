const sqlite = require('sqlite3');
const db = new sqlite.Database('./database.sqlite');

db.serialize(() => {

    //Create Employee Table
    db.run(`CREATE TABLE Employee (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        wage INTEGER NOT NULL,
        is_current_employee INTEGER DEFAULT 1
    )`);

    //Create Menu Table
    db.run(`CREATE TABLE Menu (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL
    )`);

    //Create Timesheet Table
    db.run(`CREATE TABLE Timesheet (
        id INTEGER PRIMARY KEY NOT NULL,
        hours INTEGER NOT NULL,
        rate INTEGER NOT NULL,
        date INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        FOREIGN KEY(employee_id) REFERENCES Employee(id)
    )`);

    //Create Menu Item Table
    db.run(`CREATE TABLE MenuItem (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        inventory INTEGER NOT NULL,
        price INTEGER NOT NULL,
        menu_id INTEGER NOT NULL,
        FOREIGN KEY(menu_id) REFERENCES Menu(id)
    )`);
});