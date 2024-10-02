const prefix = import.meta.env.VITE_URL_PREFIX

export function apiEventInfo(namespace,type,name){

    return fetch(`${prefix}/namespace/${namespace}/event/${type}/${name}`, {
        method: 'GET'
    })
}

