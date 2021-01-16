const db = require('./connection');
const config = require('./config.json')['development']
const {uTCtoLocal} = require('../ultilities/date')
module.exports = {
    tableExists: () => {
        //detect if table already exists
        db.query(
        `SELECT COUNT(*) as 'exists'
        FROM information_schema.tables 
        WHERE table_schema = '${config.database}' 
        AND table_name = 'tasks';`, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!res[0].exists){
                console.log('table does not exist')
            } else {
                console.log('table exists')
            }
        })
    },
    generateTable: () => {
        db.query(
            `CREATE TABLE tasks (
                id INT AUTO_INCREMENT,
                name VARCHAR(255),
                changed TINYINT(1) DEFAULT 0,
                date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
                date_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(id)
            )`, (err, res, fields) => {
                if (err) {
                    console.log(err)
                    return;
                }
                console.log(res)
            })
    },
    createRow: (data, cb)=>{
        db.query(
            `INSERT INTO indexeddb_mysql_syncing.tasks(id, name, changed, date_created, date_updated) VALUES (?, ?, ?, ?, ?)
            `, [data.id, data.name, data.changed, data.date_created, data.date_updated], (err, res)=> {
                if (err) {
                    console.log(err)
                    return;
                }
                cb();
            })
    },
    createManyRows: (data, cb)=> {

        var entries = ``
        data.tasks.forEach(task => {
            let local_date_created = uTCtoLocal(task.date_created);
            let local_date_updated = uTCtoLocal(task.date_updated);
            if (!task.id) { //if task.id is null
                id = "null"
            } else {
                id = toString(task.id)
            }
            entries +=`(${id}, "${task.name}", ${task.changed}, "${task.status}","${local_date_created}", "${local_date_updated}"),`
        })
        entries = entries.slice(0, -1)
        db.query(
            `INSERT INTO indexeddb_mysql_syncing.tasks(id, name, changed, status, date_created, date_updated) VALUES ${entries} ON DUPLICATE KEY UPDATE name = VALUES(name), changed = VALUES(changed), status = VALUES(status), date_updated = VALUES(date_updated)
            `, (err, res) => {
                if (err) {
                    throw err
                }
                cb(res)
            })
    },
    readRow: (where = 'true = true', cb)=> {//default will do the full table
        db.query(
            `SELECT * FROM indexeddb_mysql_syncing.tasks WHERE ${where}
            `,(err, res)=> {
                if(err) {
                    console.log(err)
                    return;
                }
                cb(res)
            })
    },
    updateRow: (name, id)=>{
        db.query(
            `UPDATE indexeddb_mysql_syncing.tasks SET name = ?, date_updated = CURRENT_TIMESTAMP, current = 1 WHERE id = ?
            `, [name, id], (err, res)=> {
                if(err){
                    console.log(err)
                    return;
                } 
                console.log(res)
            })
    },
    deleteRow: (id)=>{
        db.query(
            `DELETE FROM indexeddb_mysql_syncing.tasks WHERE id = ?
            `, [id], (err, res) => {
                if (err){
                    console.log(err);
                    return;
                }
                console.log(res)
            })
    }
    
}