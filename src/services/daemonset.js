const prefix = import.meta.env.VITE_URL_PREFIX

export function apiDaemonsetList(namespace,search){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/daemonset/list?search=${search}`, {
        method: 'GET'
    })
}

export function apiDaemonsetContainerSuspend(namespace,daemonset,container){

    return fetch(`${prefix}/namespace/${namespace}/daemonset/${daemonset}/container/${container}/suspend`, {
        method: 'PUT'
    })
}

export function apiDaemonsetGet(namespace,daemonset){

    return fetch(`${prefix}/namespace/${namespace}/daemonset/${daemonset}`, {
        method: 'GET'
    })
}

export function apiDaemonsetYamlGet(namespace, daemonset){

    return fetch(`${prefix}/namespace/${namespace}/daemonset/${daemonset}/yaml`, {
        method: 'GET'
    })
}

export function apiDaemonsetYamlUpdate(namespace,daemonset,yaml){

    return fetch(`${prefix}/namespace/${namespace}/daemonset/${daemonset}/yaml`, {
        method: 'PUT',
        body: yaml
    })
}

export function apiDaemonsetPodList(namespace,daemonset){
    return fetch(`${prefix}/namespace/${namespace}/daemonset/${daemonset}/pod/list`, {
        method: 'GET'
    })
}

export function apiDaemonsetServiceList(namespace,daemonset){
    return fetch(`${prefix}/namespace/${namespace}/daemonset/${daemonset}/service/list`, {
        method: 'GET'
    })
}