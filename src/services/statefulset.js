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