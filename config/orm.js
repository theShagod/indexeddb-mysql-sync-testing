const db = require('./connection');
const config = require('./config.json')['development']

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
        /*              UTC Time                Local Time
        Convert 2021-02-08T08:00:00.000Z -> "2021-02-08 00:00:00"

        */



        var entries = ``
        data.tasks.forEach(task => {
            task.date_created = new Date(task.date_created)
            task.date_updated = new Date(task.date_updated)
            let formated_date_created = `${task.date_created.getFullYear()}-${task.date_created.getMonth()+1}-${task.date_created.getDate()} ${task.date_created.getHours()}:${task.date_created.getMinutes()}:${task.date_created.getSeconds()}`;
            let formated_date_updated = `${task.date_updated.getFullYear()}-${task.date_updated.getMonth()+1}-${task.date_updated.getDate()} ${task.date_updated.getHours()}:${task.date_updated.getMinutes()}:${task.date_updated.getSeconds()}`;
            entries +=`("${task.id}", "${task.name}", ${task.changed}, "${formated_date_created}", "${formated_date_updated}"),`
        })
        entries = entries.slice(0, -1)
        db.query(
            `INSERT INTO indexeddb_mysql_syncing.tasks(id, name, changed, date_created, date_updated) VALUES ${entries}
            `, (err, res) => {
                if (err) {
                    throw err
                }
                cb(res)
            })
    },
    readRow: (where = 'true = true')=> {//default will do the full table
        db.query(
            `SELECT * FROM indexeddb_mysql_syncing.tasks WHERE ${where}
            `,(err, res)=> {
                if(err) {
                    console.log(err)
                    return;
                }
                console.log(res)
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