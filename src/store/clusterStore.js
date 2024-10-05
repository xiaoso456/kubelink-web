import { defineStore } from 'pinia'

export const useClusterInfo = defineStore('clusterInfo', {
    state: () => {
        return {
            activeId: 0,
            activeName: '',
            connection:{
              status: 'unknown' // healthy、unhealthy、connecting、unknown
            },
            raw: {
                "buildDate": "",
                "compiler": "",
                "gitCommit": "",
                "gitTreeState": "",
                "gitVersion": "",
                "goVersion": "",
                "major": "",
                "minor": "",
                "platform": ""
            }
        }
    },
    persist: {
        enabled: true,
        strategies:[
            {
                storage: localStorage,
            }
        ]
    }

})