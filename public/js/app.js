import {renderList, syncButtonEventListener, submitEventListener} from './view.js';
import {addEntry, displayEntries} from './model.js';
(() => {

    //feature checking service worker and connecting sw
    if (navigator.serviceWorker){
        window.addEventListener('load', ()=> {
            navigator.serviceWorker.register('/sw.js').then(() => {
                return navigator.serviceWorker.ready
            }).then(reg => {
                console.log('service worker registration is successful with scope of:', reg.scope)
                syncButtonEventListener(()=> {
                    reg.sync.register('example-sync').catch(console.log)
                });
            }
            ).catch(err=> {
                console.log('There was an error registering service workers:', err)
            })
        })
    }
    //feature checking indexedDB
    if (!window.indexedDB){
        console.log('no indexedDB support');
        return;
    }
    var db;
    //opening synco database
    var request = indexedDB.open('synco', 1);
    
    //if db is outdated or first time running, update it
    request.onupgradeneeded = event => {
        console.log('updating db')
        db = request.result;
        switch(event.oldVersion) {
            case 0: //indexedDB database doesn't exist
                var store = db.createObjectStore('synco', {keyPath: 'id', autoIncrement: true})
                store.createIndex('by_name', 'name')
                store.createIndex('by_changed', 'changed')
                store.createIndex('by_date_created', 'date_created')
                store.createIndex('by_date_updated', 'date_updated')
            case 1:
                
        }

    }

    request.onerror = event => {
        console.log('couldnt open database')
    }
    //opening indexeddb is successful
    request.onsuccess = event => {
        console.log('open db success')
        db = request.result;
        
        db.onerror = event => {//setting default error handling
            console.log('db error:', event.target.error)
        }
        displayEntries(db, request => {
            request.onsuccess = event => {
                renderList(request.result)
            }
        })
        submitEventListener(name => {
            addEntry(db, name, request => {
                request.onsuccess = event => {
                    displayEntries(db, request => {
                        request.onsuccess = event => {
                            renderList(request.result)
                        }
                    })
                }
            })
        })
    }

})();