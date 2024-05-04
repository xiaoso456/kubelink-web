const prefix = import.meta.env.VITE_URL_PREFIX

export function apiPodLogs(namespace,pod,container,previous,tailLines){
    if(container === undefined || container === ''){
        container = '_first'
    }
    if(previous === undefined){
        previous = false
    }
    return fetch(`${prefix}/namespace/${namespace}/pod/${pod}/container/${container}/logs?previous=${previous}&tailLines=${tailLines}`, {
        method: 'GET'
    })
}

