function addEntry(db, name, cb){
    var tx = db.transaction('synco', 'readwrite')
    var store = tx.objectStore('synco')
    var request = store.add({name: name, changed: 1, status: "none", date_created: new Date, date_updated: new Date})
        cb(request)
}


function getAllEntries(db, cb){
    //add all names
    var tx = db.transaction('synco', 'readonly')
    var store = tx.objectStore('synco')
    var request = store.index("by_status").openCursor(IDBKeyRange.bound("new","none",false, false))
    var entries = []
    request.onsuccess = event => {
        var cursor = request.result
        if (cursor) {
            entries.push(cursor.value)
            cursor.continue();
        } else {
            console.log(entries)
            cb(entries)
        }
    }
    request.onerror =event => {
        console.log('something went wrong')
    }
}

function deleteEntryOffline(db, id, cb){
    var tx = db.transaction('synco','readwrite')
    var store = tx.objectStore('synco')
    var request = store.get(id)
    request.onsuccess = event => {
        let entry = request.result
        entry.changed = 1;
        entry.status = "deleted";
        var requestPut = put(entry)
        cb(requestPut)
        requestPut.onerror = event => {
            console.log('something very bad happened')
        }
    }
    request.onerror = event => {
        console.log('something when wrong, probably couldnt find id')
    }
}

export {addEntry, getAllEntries}