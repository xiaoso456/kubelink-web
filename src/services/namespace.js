const prefix = import.meta.env.VITE_URL_PREFIX

export function apiNamespaceList(){
    return fetch(`${prefix}/namespace`, {
        method: 'GET'
    })
}