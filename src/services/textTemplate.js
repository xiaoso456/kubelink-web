const prefix = import.meta.env.VITE_URL_PREFIX

export function apiTextTemplateList(search,type){
    if(search === null || search === undefined){
        search = ""
    }
    if(type === null || type === undefined){
        type = ""
    }
    return fetch(`${prefix}/text-template/list?search=${search}&type=${type}`, {
        method: 'GET'
    })
}



export function apiTextTemplateUpdate(id,textTemplate){
    return fetch(`${prefix}/text-template/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(textTemplate)
    })
}

export function apiTextTemplateCreate(textTemplate){
    textTemplate.id = null
    return fetch(`${prefix}/text-template`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(textTemplate)
    })
}

export function apiTextTemplateDelete(id){
    return fetch(`${prefix}/text-template/${id}`, {
        method: 'DELETE'
    })
}

export function apiTextTemplateTypeList(){
    return fetch(`${prefix}/text-template/type/list`, {
        method: 'GET'
    })
}