import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'
import zhLang from 'element-plus/es/locale/lang/zh-cn'
import enLang from 'element-plus/es/locale/lang/en'

// let currentLanguage = navigator.language.replace(/-(\S*)/, '')
let currentLanguage = navigator.language.replace(/-(\S*)/, '')
let lsLocale = localStorage.getItem('locale')
if (lsLocale) {
  currentLanguage = JSON.parse(lsLocale)?.locale
}

console.log("ls:",lsLocale)
export default createI18n({
    locale: currentLanguage,
    legacy: false, // 修复组件引入i18n时vite脚手架报错的问题
    globalInjection: true, // 全局注册 $t
    messages: {
      zh,
      en
    }
  })
  
export const langs = [
    { key: 'zh', title: '中文', elKey: zhLang},
    { key: 'en', title: 'English' ,elKey: enLang}
]
  
