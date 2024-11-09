const prefix = import.meta.env.VITE_URL_PREFIX

export function apiHelmList(namespace){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    return fetch(`${prefix}/namespace/${namespace}/helm/list`, {
        method: 'GET'
    })
}
export function apiHelmExport(namespace,releaseName){
    if(namespace === undefined || namespace === ''){
        namespace = '_all'
    }
    fetch(`${prefix}/namespace/${namespace}/helm/${releaseName}/export`)
        .then(response => {
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'output.zip' // default
            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                const matches = /filename="([^"]+)"/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1]
                }
            }
            return response.blob().then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none'
                a.href = url
                // the filename you want
                a.download = filename
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                return true
            });


        }).catch((error)=>{
            console.log("下载文件失败",error)
    })

}




