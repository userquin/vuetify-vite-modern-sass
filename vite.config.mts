import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import VueRouter from 'unplugin-vue-router/vite'
import Inspect from 'vite-plugin-inspect'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { VuetifyStylesPlugin } from './plugins/vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    // with https://github.com/vitejs/vite/pull/17938 this works
    devSourcemap: true,
    // with https://github.com/vitejs/vite/pull/17938 we need to remove this entry
    // preprocessorOptions: {
    //   sass: {
    //     api: 'modern-compiler',
    //   },
    // },
    //preprocessorMaxWorkers: true,
  },
  plugins: [
    VueRouter(),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: false,
    }),
    VuetifyStylesPlugin({
      // styles: 'none',
      // styles: 'sass',
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    ViteFonts({
      google: {
        families: [ {
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    Inspect(),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
