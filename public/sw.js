var CACHE = 'synco-cache-v1'
var urlsToCache = [
    '/',
    '/js/app.js'
]


self.addEventListener('install', event => {
    console.log('installing service workers')
    event.waitUntil(
        caches.open(CACHE).then(cache => {
            console.log('opening cache');
            return cache.addAll(urlsToCache)
        })
    )
})



self.addEventListener('fetch', event => {
    console.log('fetching:', event.request.url)//loads index.html but doesn't fetch it, index.html has script and triggers fetch
    event.respondWith(
        caches.match(event.request).then(res => {
            if(res) return res; //if in cache use files in cache
            return fetch(event.request) //else use network to fetch for files
        })
    )
})

function sendToServer() {
    return new Promise((resolve, reject) => {
        var request = indexedDB.open('synco');
        request.onsuccess = event => {
            var db = event.target.result
            var changedEntries = []
            var changedValOnly = IDBKeyRange.only(1)
            var store = event.target.result.transaction('synco', 'readwrite').objectStore('synco')
            console.log('transaction openned')
            var request = store.index('by_changed').openCursor(changedValOnly)
            request.onsuccess = event => {
                var cursor = event.target.result;
                if (cursor) {
                    cursor.value.changed = 0;
                    let requestPut = store.put(cursor.value)
                    requestPut.onsuccess = event => {
                        changedEntries.push(cursor.value)
                        cursor.continue();
                    }
                } else {
                    if (changedEntries.length === 0) return resolve('Theres nothing to sync')
                    fetch('/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({tasks: changedEntries})
                    }).then(res => {
                        if (res.ok){
                            return resolve(changedEntries)
                        } else {
                            return reject('error fetching, res.ok is not ok')
                        }
                    }).catch(err => {
                        return reject('internal backend error, check server logs')
                    });
                }
            }
            db.transaction('synco').oncomplete = event => {
                console.log('transaction complete')
            }
            db.onerror = err => {
                return reject('db failed for some reason')
            }
        }
        
    })
}

//background sync
self.onsync = event => {
    if (event.tag = 'example-sync'){
        event.waitUntil(sendToServer().then(msg => {
            console.log('sync complete:', msg)
        }).catch(err => {console.log('sync error:', err)})
        
        ); 
        //waituntil keeps the sw running, if we don't have the sw, the sync event will still trigger but the sw will sleep to early potentially cause an error
        
    }

}

