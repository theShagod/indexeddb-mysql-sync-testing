var CACHE = 'synco-cache-v1'
var urlsToCache = [
    '/',
    '/js/app.js',
    '/js/view.js',
    '/js/model.js'
]
var client;

self.addEventListener('install', event => {
    console.log('installing service workers')
    event.waitUntil(
        caches.open(CACHE).then(cache => {
            console.log('opening cache');
            return cache.addAll(urlsToCache)
        })
    )
})

// in the service worker
addEventListener('message', event => {
    // event is an ExtendableMessageEvent object
    //console.log(`Intializing postMessage: ${event.data}`);
    console.log(`Intializing postMessage`);
    event.source.postMessage("success!");
    client = event.source
  });


self.addEventListener('fetch', event => {
    console.log('fetching:', event.request.url)//loads index.html but doesn't fetch it, index.html has script and triggers fetch
    event.respondWith(
        caches.match(event.request).then(res => {
            if(res) return res; //if in cache use files in cache
            return fetch(event.request) //else use network to fetch for files
        })
    )
})

function sendToServer(entries, cb) {
    var request = indexedDB.open('synco');
        request.onsuccess = event => {
            var db = event.target.result
            var tx = db.transaction(['syncoff', 'synco'], 'readwrite')
            //open syncoff
            var storeOff = tx.objectStore('syncoff')
            console.log('transaction openned')
            //open synco
            var store = tx.objectStore('synco')
            entries.forEach(entry =>{
                let requestAdd = store.add(entry)
                requestAdd.onsuccess = event => {
                    console.log('added entry')
                }
            })
            
            //get offline entries
            getChanged(storeOff, request => {
                request.onsuccess = event => {
                    let cursor = request.result;
                    if (cursor) {
                        //adding offline entries to entries var
                        cursor.value.changed = 0;
                        //deleting id so that id can be autoincremented when added to mysql and synco
                        cursor.value.id = null;
                        entries.push(cursor.value)
                        delete cursor.value.id
                        console.log(entries)
                        //adding to synco
                        var requestPut = store.add(cursor.value) //if this errors it is probably because cursor.value.id = null doesn't autoincrement for idb, this does work with mysql tho
                        requestPut.onsuccess = event => {
                            cursor.continue();
                        }
                        //need to change values with 1 to 0
                        //need to sync with database if there are new entries by getting the last id of the database and comparing with this database
                        //need to detect changes
                    } else {
                        //getting changed in synco 
                        getChanged(store, request => {
                            request.onsuccess = event => {
                                let cursor = request.result;
                                if (cursor) {
                                    cursor.value.changed = 0;
                                    entries.push(cursor.value) //these have ids and will change mysql entries with same id
                                    //updating changed values in synco
                                    var requestPut = store.put(cursor.value)
                                    requestPut.onsuccess = event => {
                                        cursor.continue();
                                    }
                                } else {
                                    if (entries.length === 0) return cb('Theres nothing to sync')
                                    fetchPostDat(entries)
                                    getChanged(storeOff, request => {
                                        request.onsuccess = event => {
                                            let cursor = request.result;
                                            if (cursor) {
                                                var requestDel = storeOff.delete(cursor.value.id)
                                                requestDel.onsuccess = event => {
                                                    cursor.continue();
                                                }
                                            } else {
                                                return cb('success')
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }

                }
            })
            db.transaction('synco').oncomplete = event => {
                client.postMessage("renderList");
                console.log('transaction complete')
            }
            db.onerror = err => {
                return 'db failed for some reason'
            }
        }
}

function getChanged (store, cb){
    var changedValOnly = IDBKeyRange.only(1)
    var request = store.index('by_changed').openCursor(changedValOnly)
    cb(request)
    
}

async function fetchPostDat(entries){
    await fetch('/', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({tasks: entries})
    }).then(res => {
        if (res.ok){
            console.log('mysql changes complete')
            return resolve(entries)
            
        } else {
            return 'error fetching, res.ok is not ok'
        }
    }).catch(err => {
        return err
        
    });
}
function fetchGetDat(id, cb){
    console.log('fetchgetdat id:', id)
    fetch(`/id/${id}`).then(res => {
        if (res.ok) {
            return res.json()
        } else {
            console.log('res.ok is not ok')
        }
    }).then(res => {//res should be data above id
        cb(res)
    }).catch(console.log)
}
function sendFromServer(){
    return new Promise ((resolve, reject) => {
        var request = indexedDB.open('synco');
        request.onsuccess = event => {
        var db = event.target.result
        var request = db.transaction(['synco'],'readonly').objectStore('synco').openKeyCursor(null, 'prev')
        request.onsuccess = event => {//gets the last id if there is one and makes entries the ids that are greater
            var cursor = request.result
            if (cursor){
                id = cursor.key
            } else {
                id = 0 
            }
            fetchGetDat(id, res => {
                console.log('res:', res)
                sendToServer(res, msg => {
                    resolve(msg)
                })
            })
            
        }
        request.onerror = event => {
            reject(event)
        }
    }
    })
}
//background sync
self.onsync = event => {
    if (event.tag = 'example-sync'){
        event.waitUntil(sendFromServer().then(msg => {
            console.log('sync complete:', msg)
            
        }).catch(err => {console.log('sync error:', err)})
        
        ); 
        //waituntil keeps the sw running, if we don't have the sw, the sync event will still trigger but the sw will sleep to early potentially cause an error
        
    }

}


