const prefix = import.meta.env.VITE_URL_PREFIX
export function apiClusterGet(id) {
    return fetch(`${prefix}$/cluster/config/${id}`, {
        method: 'GET'
    })
}

export function apiClusterUpdate(id,clusterConfig) {
    return fetch(`${prefix}/cluster/config/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: clusterConfig.name,
            config: clusterConfig.config
        })
    })
}

export function apiClusterList() {
    return fetch(`${prefix}/cluster/config/list`, {
        method: 'GET'
    })
}

export function apiClusterConnect(id) {
    return fetch(`${prefix}/cluster/config/${id}/connect`, {
        method: 'GET'
    })
}

export function apiClusterActive(id) {
    return fetch(`${prefix}/cluster/config/${id}/active`, {
        method: 'PUT'
    })
}

export function apiClusterDelete(id) {
    return fetch(`${prefix}/cluster/config/${id}`, {
        method: 'DELETE'
    })
}

export function apiClusterAdd(name, config) {
    return fetch(`${prefix}/cluster/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            config: config
        })
    })
}

export function apiCurrentClusterStatus() {
    return fetch(`${prefix}/cluster/config/current/status`, {
        method: 'GET'
    })
}