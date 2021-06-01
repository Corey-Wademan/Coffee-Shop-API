const express = require('express');
const menuRouter = express.Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuItem');

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`SELECT * FROM Menu WHERE Menu.id = $menuId`, { $menuId: menuId }, (err, menu) => {
        if (err) {
            next(err)
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            return res.sendStatus(404)
        }
    })
});

menuRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, menus) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ menus: menus })
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu })
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400)
    }

    db.run(`INSERT INTO Menu (title) VALUES ($title)`, { $title: title }, function (err) {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
                res.status(201).json({ menu: menu })
            });
        }
    });
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400)
    }
    
    db.run(`UPDATE Menu SET title = $title WHERE Menu.id = $menuId`, {
        $title: title,
        $menuId: req.params.menuId
    }, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
                res.status(200).json({ menu: menu })
            });
        }
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`, { $menuId: req.params.menuId }, (err, item) => {
        if (err) {
            next(err)
        } else if (item) {
            return res.sendStatus(400)
        } else {
            db.run(`DELETE FROM Menu WHERE Menu.id = $menuId`, { $menuId: req.params.menuId }, (err) => {
                if (err) {
                    next(err)
                } else {
                    res.sendStatus(204)
                }
            });
        }
    });
});




module.exports = menuRouter;