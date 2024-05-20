import { defineStore } from 'pinia'

export const useSelectedOptionValue = defineStore('selectedOptionValue', {
    state: () => {
        return {
            selectedOption: 'Deployment'
        }
        // return ref('Deployment')
    },
    persist: {
        enabled: true,
    }

})