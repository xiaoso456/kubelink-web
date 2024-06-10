const prefix = import.meta.env.VITE_URL_PREFIX

export function apiServiceList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/service/list?search=${search}`, {
        method: 'GET'
    })
}



export function apiServiceGet(namespace,service){

    return fetch(`${prefix}/namespace/${namespace}/service/${service}`, {
        method: 'GET'
    })
}

export function apiServiceDelete(namespace,service){

    return fetch(`${prefix}/namespace/${namespace}/service/${service}`, {
        method: 'DELETE'
    })
}

// export function apiServiceYamlGet(namespace, service){
//
//     return fetch(`${prefix}/namespace/${namespace}/service/${service}/yaml`, {
//         method: 'GET'
//     })
// }

export function apiServiceUpdate(namespace,serviceName,service){
    return fetch(`${prefix}/namespace/${namespace}/service/${serviceName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(service)
    })
}
