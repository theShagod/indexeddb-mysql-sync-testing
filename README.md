need to connect to mysql database


source of truth is mysql database
user is online and adds entries which adds to both indexeddb and mysql
When user goes offline, indexeddb data is shown
user changes data which updates indexeddb data, 


### Features
 - background sync
 - works with multiple devices
 - offline use
 

## Synchronization Proposal

### user is online
each entry has a `changed` column, defaults to `false`
changing an entry does not change the `changed` column


### user is offline
changing an entry changes the `changed` column to `true`
"deleting" an entry changes the `changed` column to `true` and sets the row to `null`
creating entries changes the `changed` column to `new` and doesn't change to `changed` if modified later
`new` rows will have ids must 1000 than the other rows to prevent conflicting ids

### SYNCING, user goes from offline -> online
indexeddb looks at the `changed` column to see if anything was changed. If something was changed, mysql will update itself
If a indexedDB row is all `null`, the data is deleted from both the indexeddb and mysql database
created entries with `new` are deleted from indexeddb and then added to mysql to see what the id is, and then creates new entry in indexedDB with matching id


### What if we have conflicting data sources
For example, the user is offline and makes changes and then on different online device, what happens?
time stamps and what is newer is used

### how much data is sent to indexeddb
there is no limit to the amount of data on indexeddb


### Mysql database structure
-columns: `id`, `name`, `changed`, `date_created`,`date_updated`
each user has there only table