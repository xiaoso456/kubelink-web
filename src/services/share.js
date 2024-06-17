const prefix = import.meta.env.VITE_URL_PREFIX

export function apiClusterConfigExport(ids){
    let idsString = ''
    if(ids){
        idsString = ids.join(',')
    }

    return fetch(`${prefix}/share/cluster-config/export?ids=${idsString}`, {
        method: 'GET'
    })
}

export function apiSyncConfigExport(ids){
    let idsString = ''
    if(ids){
        idsString = ids.join(',')
    }

    return fetch(`${prefix}/share/sync-config/export?ids=${idsString}`, {
        method: 'GET'
    })
}

export function apiImport(text){
    return fetch(`${prefix}/share/common/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: text
    })
}


