import {renderList, syncButtonEventListener, submitEventListener, deleteEventListener} from './view.js';
import {addEntry, getAllEntries, userDeleteEntry} from './model.js';
(() => {
    var db;
    //feature checking service worker and connecting sw
    if (navigator.serviceWorker){
        window.addEventListener('load', ()=> {
            navigator.serviceWorker.register('/sw.js').then(() => {
                return navigator.serviceWorker.ready
            }).then(reg => {
                reg.active.postMessage("Hi service worker");
                //reg.active.postMessage("Hi service worker");
                console.log('service worker registration is successful with scope of:', reg.scope)
                syncButtonEventListener(()=> {
                    
                    console.log('sync button clicked')
                    reg.sync.register('example-sync').then().catch(msg => console.log('asdf',msg))
                    
                });
            }).catch(err=> {
                console.log('There was an error registering service workers:', err)
            })
        })

        navigator.serviceWorker.addEventListener('message', event => {
            // event is a MessageEvent object
            console.log(`SW says: ${event.data}`);
            if (event.data === "renderList"){
                getAllEntries(db, data => {
                    if (data.length) renderList(data)
                })
            }
        });
    }
    //feature checking indexedDB
    if (!window.indexedDB){
        console.log('no indexedDB support');
        return;
    }
    
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
                store.createIndex('by_status', 'status')
                store.createIndex('by_date_created', 'date_created')
                store.createIndex('by_date_updated', 'date_updated')
                var storeOff = db.createObjectStore('syncoff', {keyPath: 'id', autoIncrement: true})
                storeOff.createIndex('by_name', 'name')
                storeOff.createIndex('by_changed', 'changed')
                storeOff.createIndex('by_status', 'status')
                storeOff.createIndex('by_date_created', 'date_created')
                storeOff.createIndex('by_date_updated', 'date_updated')
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
        getAllEntries(db, data => {
            if (data.length) renderList(data)
        })
        //console.log('TESTING: ', window.postMessage)
        //console.log('TESTING: ', navigator.serviceWorker.postMessage)
        submitEventListener(name => {
            addEntry(db, name, request => {
                request.onsuccess = event => {
                    getAllEntries(db, data => {
                        if (data.length) renderList(data)
                    })
                }
            })
        })
        deleteEventListener(idDOM => {
            userDeleteEntry(db, idDOM, requestPut => {
                requestPut.onsuccess = event => {
                    console.log('user deleted entry of id tag:', idDOM)
                }
            })
        })
    }



})();

