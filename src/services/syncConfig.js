export function apiSyncTypeList() {
    return fetch(`/api/sync/sync-type/list`, {
        method: 'GET'
    })
}


export function apiSyncConfigList() {
    return fetch(`/api/sync/config/list`, {
        method: 'GET'
    })
}

export function apiSyncConfigAdd(syncType,autoSync,enable,namespace,pod,container,source,target) {
    return fetch(`/api/sync/config`, {
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
    return fetch(`/api/sync/config/${id}`, {
        method: 'DELETE'
    })
}

export function apiSyncConfigUpdate(id,config){
    return fetch(`/api/sync/config/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
}