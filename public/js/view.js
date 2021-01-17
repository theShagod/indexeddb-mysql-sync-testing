function renderList(data){
    var displayBox = document.querySelector('#display')
    //clear displayBox
    for(let i = displayBox.children.length-1; i >= 0; i--){
        displayBox.children[i].remove();
    }
    data.forEach(element => {
        let li = document.createElement('li')
        li.innerText = element.name
        li.setAttribute('id', `${element.origin}-${element.id}`)
        displayBox.append(li)
    });
}

function syncButtonEventListener(cb){
    document.querySelector('#sync').addEventListener('click', event =>{
        cb()
    })
}
function submitEventListener(cb){
    document.addEventListener('submit', event => {
        event.preventDefault();
        var addEntryBox = document.querySelector('#addEntry')
        if(addEntryBox.value.trim() == '') return; //if just spaces
        cb(addEntryBox.value)
        addEntryBox.value = ''
    })
}
function deleteEventListener(cb){
    document.addEventListener('click', event => {
        let target = event.target.closest('li');
        if (!target) return;
        let id = target.getAttribute("id")
        if (id){
            //remove item clicked on from <ul>
            cb(id)
            target.remove()
        }
    })
}

export {renderList, syncButtonEventListener, submitEventListener, deleteEventListener}
