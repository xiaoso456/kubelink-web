const prefix = import.meta.env.VITE_URL_PREFIX

export function apiSyncTypeList() {
    return fetch(`${prefix}/sync/sync-type/list`, {
        method: 'GET'
    })
}


export function apiSyncConfigList() {
    return fetch(`${prefix}/sync/config/list`, {
        method: 'GET'
    })
}

export function apiSyncConfigAdd(syncType,autoSync,enable,namespace,pod,container,source,target) {
    return fetch(`${prefix}/sync/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            syncType: syncType,
            autoSync: autoSync,
            enable: enable,
            namespace: namespace,
            pod: pod,
            container: container,
            source: source,
            target: target
        })
    })
}



export function apiSyncConfigDelete(id) {
    return fetch(`${prefix}/sync/config/${id}`, {
        method: 'DELETE'
    })
}

export function apiSyncConfigUpdate(id,config){
    return fetch(`${prefix}/sync/config/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
}

export function apiSyncOnly(id){
    return fetch(`${prefix}/sync/config/${id}/sync-only`, {
        method: 'POST'
    })
}

export function apiDeleteResource(id, type){
    return fetch(`${prefix}/sync/config/${id}/delete-resource/${type}`, {
        method: 'POST'
    })
}

export function apiSyncLocalPath(path) {
    return fetch(`${prefix}/sync/local/path`, {
        method: 'POST',
        body: path
    })
}

export function apiSyncPodPath(namespace,pod,container,path) {
    if(container === undefined || container === ''){
        container = '_first'
    }
    return fetch(`${prefix}/sync/namespace/${namespace}/pod/${pod}/container/${container}/path`, {
        method: 'POST',
        body: path
    })
}
