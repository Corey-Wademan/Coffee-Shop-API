const express = require('express');
const menuItemsRouter = express.Router({ mergeParams:true });
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, (err, menuItems) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ menuItems: menuItems })
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;
    
    if (!name || !description || !inventory || !price || !menuId) {
        return res.sendStatus(400)
    }
    db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err) => {
        if (err) {
            next(err)
        } else {
            db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) 
            VALUES ($name, $description, $inventory, $price, $menuId)`, {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId
        }, function (err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err, menuItem) => {
                    res.status(201).json({menuItem: menuItem})
                });
            }
        });
        }
    })

    
});



module.exports = menuItemsRouter;