import { defineStore } from 'pinia'
import i18n from '@/locales/i18nconfig.js'

export const useLocale = defineStore('locale', {
    state: () => {
        return {
            'locale':  i18n.global.locale.value
        }
    },
    actions: {
        setLocale(locale) {
            this.locale = locale
            i18n.global.locale.value = locale
        }
    },
    persist: {
        enabled: true,
        strategies:[
            {
                storage: localStorage,
            }
        ]
    },
    
})