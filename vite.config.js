import {defineConfig,loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import Inspect from 'vite-plugin-inspect'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import path from 'path'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";


const pathSrc = path.resolve(__dirname, 'src')
// https://vitejs.dev/config/
export default ({mode})=>{
    const env = loadEnv(mode, process.cwd())

    return defineConfig({
        server:{
            port: 3000,
            open: true,
            https: false,
            proxy: {
                '/api': {
                    target: 'http://localhost:15151',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '')
                },
                '/api-ws':{
                    target: 'ws://localhost:15151',
                    ws: true,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api-ws/, '')

                }
            }
        },
        resolve: {
            alias: {
                '@': pathSrc,
            },
        },
        plugins: [
            vue(),
            AutoImport({
                imports: ['vue'],
                resolvers: [
                    ElementPlusResolver(),
                    IconsResolver({
                        prefix: 'Icon',
                    }),
                ],
                dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
            }),
            Components({

                resolvers: [
                    ElementPlusResolver(),
                    IconsResolver({
                        enabledCollections: ['ep'],
                    }),
                ],
                dts: path.resolve(pathSrc, 'components.d.ts'),

            }),
            Icons({
                autoInstall: true,
            }),
            Inspect(),
            createSvgIconsPlugin({
                iconDirs: [path.resolve(process.cwd(), 'src/icons')],
                symbolId: 'icon-[dir]-[name]',
            }),

        ],
    })
}
