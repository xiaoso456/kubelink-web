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

export function apiDeploymentGet(namespace,deployment){

    return fetch(`${prefix}/namespace/${namespace}/deployment/${deployment}`, {
        method: 'GET'
    })
}

export function apiDeploymentYamlGet(namespace, deployment){

    return fetch(`${prefix}/namespace/${namespace}/deployment/${deployment}/yaml`, {
        method: 'GET'
    })
}

export function apiDeploymentYamlUpdate(namespace,deployment,yaml){

    return fetch(`${prefix}/namespace/${namespace}/deployment/${deployment}/yaml`, {
        method: 'PUT',
        body: yaml
    })
}

export function apiDeploymentPodList(namespace,deployment){
    return fetch(`${prefix}/namespace/${namespace}/deployment/${deployment}/pod/list`, {
        method: 'GET'
    })
}

export function apiDeploymentServiceList(namespace,deployment){
    return fetch(`${prefix}/namespace/${namespace}/deployment/${deployment}/service/list`, {
        method: 'GET'
    })
}