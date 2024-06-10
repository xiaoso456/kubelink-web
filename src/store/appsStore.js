import { defineStore } from 'pinia'

export const useSelectedOptionValue = defineStore('selectedOptionValue', {
    state: () => {
        return {
            selectedOption: 'Deployment',
            selectedNetworkOption: 'Service',
            selectedConfigOption: 'ConfigMap',
            selectedNamespaceOption: '',
        }
        // return ref('Deployment')
    },
    persist: {
        enabled: true,
    }

})