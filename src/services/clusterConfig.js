export function apiClusterGet(id) {
    return fetch(`/api/cluster/config/${id}`, {
        method: 'GET'
    })
}

export function apiClusterUpdate(id,clusterConfig) {
    return fetch(`/api/cluster/config/${id}`, {
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
    return fetch(`/api/cluster/config/list`, {
        method: 'GET'
    })
}

export function apiClusterConnect(id) {
    return fetch(`/api/cluster/config/${id}/connect`, {
        method: 'GET'
    })
}

export function apiClusterActive(id) {
    return fetch(`/api/cluster/config/${id}/active`, {
        method: 'PUT'
    })
}

export function apiClusterDelete(id) {
    return fetch(`/api/cluster/config/${id}`, {
        method: 'DELETE'
    })
}

export function apiClusterAdd(name, config) {
    return fetch(`/api/cluster/config`, {
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