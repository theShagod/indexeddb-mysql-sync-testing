const express = require('express');
const { readRow } = require('./config/orm');
const app = express();
const PORT = 5050;
const orm = require('./config/orm')

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static('public'))

app.post('/', (req, res)=> {
    //data should look like this: {id: 1, name: "task", change: 0, date_created: somedate, date_updated: somedate}
    if (req.body.length){
        orm.createManyRows(req.body, result => {
            res.redirect('/')
        })
    }
    console.log('no data received')
    
})

app.get('/id/:id', (req, res)=> {
    console.log(req.params.id)
    orm.readRow(`id > ${req.params.id}`, result => {
        res.json(result)
    })
})

app.listen(PORT, ()=>{
    console.log(`Listening to Port ${PORT}`);
    //corm.generateTable()
    //orm.createRow()
    //orm.readRow()
    //orm.updateRow()
    //orm.deleteRow()
    //orm.createRow('cook')
    //orm.readRow('id', '2')
});