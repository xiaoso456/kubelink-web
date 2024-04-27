const prefix = import.meta.env.VITE_URL_PREFIX

export function apiDeploymentList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/deployment/list?search=${search}`, {
        method: 'GET'
    })
}

export function apiDeploymentContainerSuspend(namespace,deployment,container){

    return fetch(`${prefix}/namespace/${namespace}/deployment/${deployment}/container/${container}/suspend`, {
        method: 'PUT'
    })
}