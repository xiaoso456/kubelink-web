const prefix = import.meta.env.VITE_URL_PREFIX

export function apiJobList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/job/list?search=${search}`, {
        method: 'GET'
    })
}

export function apiJobContainerSuspend(namespace,job,container){

    return fetch(`${prefix}/namespace/${namespace}/job/${job}/container/${container}/suspend`, {
        method: 'PUT'
    })
}

export function apiJobGet(namespace,job){

    return fetch(`${prefix}/namespace/${namespace}/job/${job}`, {
        method: 'GET'
    })
}

export function apiJobDelete(namespace,job){

    return fetch(`${prefix}/namespace/${namespace}/job/${job}`, {
        method: 'DELETE'
    })
}

export function apiJobYamlGet(namespace, job){

    return fetch(`${prefix}/namespace/${namespace}/job/${job}/yaml`, {
        method: 'GET'
    })
}

export function apiJobYamlUpdate(namespace,job,yaml){

    return fetch(`${prefix}/namespace/${namespace}/job/${job}/yaml`, {
        method: 'PUT',
        body: yaml
    })
}

export function apiJobPodList(namespace,job){
    return fetch(`${prefix}/namespace/${namespace}/job/${job}/pod/list`, {
        method: 'GET'
    })
}

export function apiJobServiceList(namespace,job){
    return fetch(`${prefix}/namespace/${namespace}/job/${job}/service/list`, {
        method: 'GET'
    })
}