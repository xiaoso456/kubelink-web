const prefix = import.meta.env.VITE_URL_PREFIX

export function apiConfigmapList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/configmap/list?search=${search}`, {
        method: 'GET'
    })
}



export function apiConfigmapGet(namespace,configmap){

    return fetch(`${prefix}/namespace/${namespace}/configmap/${configmap}`, {
        method: 'GET'
    })
}

export function apiConfigmapDelete(namespace,configmap){

    return fetch(`${prefix}/namespace/${namespace}/configmap/${configmap}`, {
        method: 'DELETE'
    })
}

// export function apiServiceYamlGet(namespace, service){
//
//     return fetch(`${prefix}/namespace/${namespace}/service/${service}/yaml`, {
//         method: 'GET'
//     })
// }

export function apiConfigmapUpdate(namespace,configmapName,configmap){
    return fetch(`${prefix}/namespace/${namespace}/configmap/${configmapName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(configmap)
    })
}

export function apiConfigmapCreate(namespace,configmap){
    return fetch(`${prefix}/namespace/${namespace}/configmap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(configmap)
    })
}

export function apiConfigmapYamlGet(namespace, configmap){

    return fetch(`${prefix}/namespace/${namespace}/configmap/${configmap}/yaml`, {
        method: 'GET'
    })
}

export function apiConfigmapYamlUpdate(namespace,configmap,yaml){

    return fetch(`${prefix}/namespace/${namespace}/configmap/${configmap}/yaml`, {
        method: 'PUT',
        body: yaml
    })
}