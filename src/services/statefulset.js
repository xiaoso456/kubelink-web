const prefix = import.meta.env.VITE_URL_PREFIX

export function apiStatefulsetList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/statefulset/list?search=${search}`, {
        method: 'GET'
    })
}

export function apiStatefulsetContainerSuspend(namespace,statefulset,container){

    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}/container/${container}/suspend`, {
        method: 'PUT'
    })
}

export function apiStatefulsetGet(namespace,statefulset){

    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}`, {
        method: 'GET'
    })
}

export function apiStatefulsetCreate(namespace,statefulsetJson){
    return fetch(`${prefix}/namespace/${namespace}/statefulset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: statefulsetJson
    })
}

export function apiStatefulsetDelete(namespace,statefulset){

    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}`, {
        method: 'DELETE'
    })
}

export function apiStatefulsetUpdate(namespace,statefulsetName,statefulset){
    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulsetName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(statefulset)
    })
}


export function apiStatefulsetYamlGet(namespace, statefulset){

    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}/yaml`, {
        method: 'GET'
    })
}

export function apiStatefulsetYamlUpdate(namespace,statefulset,yaml){

    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}/yaml`, {
        method: 'PUT',
        body: yaml
    })
}

export function apiStatefulsetPodList(namespace,statefulset){
    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}/pod/list`, {
        method: 'GET'
    })
}

export function apiStatefulsetServiceList(namespace,statefulset){
    return fetch(`${prefix}/namespace/${namespace}/statefulset/${statefulset}/service/list`, {
        method: 'GET'
    })
}

