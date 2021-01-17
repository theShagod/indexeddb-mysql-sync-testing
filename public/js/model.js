function addEntry(db, name, cb){
    var tx = db.transaction('syncoff', 'readwrite')
    var store = tx.objectStore('syncoff')
    var request = store.add({name: name, changed: 1, status: "none", date_created: new Date, date_updated: new Date})
    cb(request)
}


function getAllEntries(db, cb){
    //add all names
    var tx = db.transaction('synco', 'readonly')
    var store = tx.objectStore('synco')
    var request = store.index("by_status").openCursor(IDBKeyRange.only("none"))
    var entries = []
    request.onsuccess = event => {
        var cursor = request.result
        if (cursor) {
            cursor.value.origin = "synco"
            entries.push(cursor.value)
            cursor.continue();
        } else {
            var requestOff = db.transaction('syncoff', 'readonly').objectStore('syncoff').index("by_status").openCursor(IDBKeyRange.only("none"))
            requestOff.onsuccess = event => {
                var cursor = requestOff.result
                if (cursor) {
                    cursor.value.origin = "syncoff"
                    entries.push(cursor.value)
                    cursor.continue();    
                } else {
                    cb(entries)
                }
            }
        }
    }
    request.onerror =event => {
        console.log('something went wrong')
    }
}

function userDeleteEntry(db, idDOM, cb){
    //id is the id of html 
    var id = idDOM.match(/(?<=-).+$/)
    var storeName = idDOM.match(/^.+(?=-)/)
    var tx = db.transaction(['synco', 'syncoff'],'readwrite')
    var store = tx.objectStore(storeName)
    var request = store.get(parseInt(id))
    request.onsuccess = event => {
        let entry = request.result
        entry.changed = 1;
        entry.status = "deleted";
        entry.date_updated = new Date;
        var requestPut = store.put(entry)
        cb(requestPut)
        requestPut.onerror = event => {
            console.log('something very bad happened')
        }
    }
    request.onerror = event => {
        console.log('something when wrong, probably couldnt find id')
    }
}

export {addEntry, getAllEntries, userDeleteEntry}