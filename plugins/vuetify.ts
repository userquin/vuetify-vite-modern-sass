import type { Plugin } from 'vite'
import type { ImportPluginOptions } from '@vuetify/loader-shared'
import path from 'upath'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'
import { pathToFileURL } from 'node:url'
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises'
import {URLSearchParams} from "url";

export interface VuetifyOptions {
  autoImport?: ImportPluginOptions
  styles?: true | 'none' | 'sass' | {
    configFile: string
    useViteFileImport?: boolean
  }
}

export function VuetifyStylesPlugin(options: VuetifyOptions) {
  let configFile: string | undefined
  // let cacheDir: string | undefined
  const vuetifyBase = resolveVuetifyBase()
  const noneFiles = new Set<string>()
  let isNone = false
  let sassVariables = false
  let fileImport = false
  const PREFIX = 'vuetify-styles/'

  return {
    name: 'vuetify-styles',
    enforce: 'pre',
    async configResolved (config) {
      isNone = options.styles === 'none'
      if (isObject(options.styles)) {
        sassVariables = true
        const root = config.root || process.cwd()
        // cacheDir = path.resolve(config.cacheDir, 'vuetify-styles')
        fileImport = options.styles.useViteFileImport === true
        if (path.isAbsolute(options.styles.configFile)) {
          configFile = path.resolve(options.styles.configFile)
        } else {
          configFile = path.resolve(path.join(root, options.styles.configFile))
        }
        configFile = fileImport
          ? pathToFileURL(configFile).href
          : normalizePath(configFile)
      }
    },
    async resolveId (source, importer, { custom }) {
      if (
        source === 'vuetify/styles' || (
          importer &&
          source.endsWith('.css') &&
          isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
        )
      ) {
        if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, {skipSelf: true, custom})
        }

        const resolution = await this.resolve(source, importer, {skipSelf: true, custom})
        if (!resolution)
          return

        const target = resolution.id.replace(/\.css$/, '.sass')
        if (isNone) {
          noneFiles.add(target)
          return target
        }

        return `${PREFIX}${path.relative(vuetifyBase, target)}`

        /*const tempFile = path.resolve(
          cacheDir,
          path.relative(path.join(vuetifyBase, 'lib'), target),
        )
        await mkdir(path.dirname(tempFile), { recursive: true })
        await writeFile(
          path.resolve(cacheDir, tempFile),
          `@use "${configFile}"\n@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"`,
          'utf-8',
        )
        return tempFile*/
      }
    },
    load(id) {
      if (sassVariables && id.startsWith(PREFIX)) {
        const target = path.resolve(vuetifyBase, id.slice(PREFIX.length))
        return {
          code: `@use "${configFile}"\n@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"`,
          map: {
            mappings: '',
          },
        }
      }
      return isNone && noneFiles.has(id) ? '' : undefined
    }/*,
    transform(_, id) {
      if (sassVariables && id.startsWith('vuetify-styles/')) {
        const target = path.resolve(vuetifyBase, id.slice('vuetify-styles/'.length))
        return {
          code: `@use "${configFile}"\n@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"`,
          map: {
            mappings: '',
          },
        }
      }
    }*/
    /*,
    transform(code, id) {
      if (sassVariables) {
        const { query, path } = parseId(id)
        const isVueVirtual = query && 'vue' in query
        const isVueFile = !isVueVirtual &&
          !/^import { render as _sfc_render } from ".*"$/m.test(code)
        const isVueTemplate = isVueVirtual && (
          query.type === 'template' ||
          (query.type === 'script' && query.setup === 'true')
        )

        if (path.endsWith('.js') && (isVueFile || isVueTemplate)) {
          const regex = new RegExp(`(import\\s+['"](${vuetifyBase}(.*)).css['"])`)
          let match = regex.exec(code)
          if (match) {
            do {
              code = code.replace(
                match[1],
                `import "#vuetify-styles${match[3]}.sass"`,
              )
              match = regex.exec(code)
            } while (match)
            if (path.endsWith('_VApp_index__mjs.js')) {
              console.log(code)
            }
            return {
              code,
              map: null,
            }
          }
        }

        return null
      }
    },*/
  } satisfies Plugin
}

function parseId (id: string) {
  const [pathname, query] = id.split('?')

  return {
    query: query ? Object.fromEntries(new URLSearchParams(query)) : null,
    path: pathname ?? id
  }
}

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
