# TODO Offline-first App
This is a website that you can log tasks and it will save our any number of apps.

## Installation

Download files and run:
```
npm install
```
This project uses mysql. Put your mysql database settings in `config/config.json`. The table name must be `tasks`.

## Features
 - background sync
 - works with multiple devices
 - offline use
 - multiple devices
 - service workers
 - postMessage
 - mySQL
 - node + express
 - JAWSDB
 - indexedDB
 

## Mysql database structure
This app uses `synco` and `syncoff` objectstores. Entries that are not synced to remote mysql database are placed in `syncoff` until sync happens.
-columns: `id`, `name`, `changed`, `status`, `date_created`,`date_updated`

`status` - can only have `none`(default), `deleted`

## How the Synchronization Works

Each entry has a `changed` column, defaults to `1`
When the user clicks the sync button, all columns that have `changed` of `1` are changed to a value of `0` and added to the online database.
If the user is offline, as soon at the user has internet connection, the sync will happen.

Clicking on an entry will "delete" the entry make it invisible. `status` changes to `deleted`. `status` is `none` by default.

### how much data is sent to indexeddb
there is no limit to the amount of data on indexeddb but there is a 5 mb restriction on the JAWSDB because I am using free subscription. Contact theshagod@gmail.com if you this product is useful and would like to see more development.


### Syncing method order
 1. get new entries in mysql by comparing id numbers add to `var entries` and add to `synco`
 2. open `syncoff` and `synco`
 3. get offline entries and add to `var entries` and add to `synco`
 4. get changed entries in `synco` and add to `var entries` (with ids so it puts instad of adds in mysql) and PUT to `synco`
 5. add `var entries` to mysql
 6. clear `syncoff` and send `postMessage` to client that transaction is complete so that it can `postMessage` to let client know to render the list again


### References
 - Very useful indexeddb resource: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 - The single most useful link about using postmessage with service workers: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/message_event

 ### Note to self

When deploying don't forget to use process.env.PORT || hardportnumberhere or heroku will crash. Source: https://stackoverflow.com/questions/14322989/first-heroku-deploy-failed-error-code-h10