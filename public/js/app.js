import defaultExport from './view.js';
(() => {
    if (navigator.serviceWorker){
        window.addEventListener('load', ()=> {
            navigator.serviceWorker.register('/sw.js').then(() => {
                return navigator.serviceWorker.ready
            }).then(reg => {
                console.log('service worker registration is successful with scope of:', reg.scope)
                document.querySelector('#sync').addEventListener('click', event =>{
                    reg.sync.register('example-sync').catch(console.log)
                })
            }
            ).catch(err=> {
                console.log('There was an error registering service workers:', err)
            })
        })
    }
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

        displayEntries()
        //add eventlisteners for buttons
        //put, post requests to sync
        document.addEventListener('submit', event => {
            event.preventDefault();
            addEntry();

        })
        document.querySelector('#sync').addEventListener('click', event => {
            //fetch()
        })

    }
    function addEntry(){
        
        var addEntryBox = document.querySelector('#addEntry')
        if(addEntryBox.value.trim() == '') return; //if just spaces
        var tx = db.transaction('synco', 'readwrite')
        var store = tx.objectStore('synco')
        var request = store.add({name: addEntryBox.value, changed: 1, date_created: new Date, date_updated: new Date})
        addEntryBox.value = ''
        request.onsuccess = event => {
            displayEntries()
        }
        
    }
    function displayEntries(){
        var displayBox = document.querySelector('#display')
        //clear displayBox
        for(let i = displayBox.children.length-1; i >= 0; i--){
            displayBox.children[i].remove();
        }
        //add all names
        var tx = db.transaction('synco', 'readonly')
        var store = tx.objectStore('synco')
        var request = store.getAll()
        request.onsuccess = event => {
            request.result.forEach(element => {
                let li = document.createElement('li')
                li.innerText = element.name
                li.setAttribute('id', element.id)
                displayBox.append(li)
            });
        }
    }
    function getEntries(){
        var request = db.transaction('synco', 'readyonly').objectStore('synco').getAll()
        request.onsuccess = event => {

        }
    }
    
})();