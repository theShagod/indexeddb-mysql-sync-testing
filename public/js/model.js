function addEntry(db, name, cb){
    var tx = db.transaction('synco', 'readwrite')
    var store = tx.objectStore('synco')
    var request = store.add({name: name, changed: 1, date_created: new Date, date_updated: new Date})
        cb(request)
}

function getEntries(db, cb){
    var request = db.transaction('synco', 'readyonly').objectStore('synco').getAll()
    cb(request)
}

function displayEntries(db, cb){
    //add all names
    var tx = db.transaction('synco', 'readonly')
    var store = tx.objectStore('synco')
    var request = store.getAll()
    cb(request)
}

export {addEntry, displayEntries}