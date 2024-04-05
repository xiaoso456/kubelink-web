const prefix = import.meta.env.VITE_URL_PREFIX

export function apiNamespaceList(){
    return fetch(`${prefix}/namespace`, {
        method: 'GET'
    })
}

export function apiPodList(namespace){
    return fetch(`${prefix}/namespace/${namespace}/pods`, {
        method: 'GET'
    })
}

export function apiPodContainerList(namespace,pod){
    return fetch(`${prefix}/namespace/${namespace}/pods/${pod}/containers`, {
        method: 'GET'
    })
}