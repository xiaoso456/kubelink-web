import { defineStore } from 'pinia'

export const useSelectedOptionValue = defineStore('selectedOptionValue', {
    state: () => {
        return {
            selectedOption: 'Deployment',
            selectedNetworkOption: 'Service',
            selectedNamespaceOption: '',
        }
        // return ref('Deployment')
    },
    persist: {
        enabled: true,
    }

})