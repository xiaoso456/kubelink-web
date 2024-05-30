const prefix = import.meta.env.VITE_WS_PREFIX

export function createWS(url){
    return new WebSocket(`ws://${location.host}${prefix}${url}`)
}

