const prefix = import.meta.env.VITE_URL_PREFIX

export function apiSecretList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/secret/list?search=${search}`, {
        method: 'GET'
    })
}



export function apiSecretGet(namespace,secret){

    return fetch(`${prefix}/namespace/${namespace}/secret/${secret}`, {
        method: 'GET'
    })
}

export function apiSecretDelete(namespace,secret){

    return fetch(`${prefix}/namespace/${namespace}/secret/${secret}`, {
        method: 'DELETE'
    })
}

export function apiSecretUpdate(namespace,secretName,secret){
    return fetch(`${prefix}/namespace/${namespace}/secret/${secretName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(secret)
    })
}

export function apiSecretCreate(namespace,secret){
    return fetch(`${prefix}/namespace/${namespace}/secret`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(secret)
    })
}

export function apiSecretYamlGet(namespace, secret){

    return fetch(`${prefix}/namespace/${namespace}/secret/${secret}/yaml`, {
        method: 'GET'
    })
}

export function apiSecretYamlUpdate(namespace,secret,yaml){

    return fetch(`${prefix}/namespace/${namespace}/secret/${secret}/yaml`, {
        method: 'PUT',
        body: yaml
    })
}