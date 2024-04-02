import { defineStore } from 'pinia'

export const useClusterInfo = defineStore('clusterInfo', {
    state: () => {
        return {
            activeId: 0,
            activeName: '',
        }
    },
    persist: {
        enabled: true,
    }

})