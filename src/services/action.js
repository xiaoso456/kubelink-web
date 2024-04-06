const prefix = import.meta.env.VITE_URL_PREFIX

export function apiActionSuspend(namespace,pod,container){
    return fetch(`${prefix}/action/suspend/${namespace}/${pod}/${container}`, {
        method: 'PUT'
    })
}

