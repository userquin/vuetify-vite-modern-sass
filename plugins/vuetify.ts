import type { Plugin } from 'vite'
import type {Options } from '@vuetify/loader-shared'
import path from 'upath'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'

export function VuetifyStylesPlugin(options: Options) {
  let configFile: string | undefined
  const vuetifyBase = resolveVuetifyBase()
  const tempFiles = new Map<string, string>()
  const isNone = options.styles === 'none'
  const usingSassVariables = isNone ? false : isObject(options.styles)
  return {
    name: 'vuetify-styles',
    enforce: 'pre',
    configResolved (config) {
      if (isObject(options.styles)) {
        if (path.isAbsolute(options.styles.configFile)) {
          configFile = path.resolve(options.styles.configFile)
        } else {
          configFile = path.resolve(path.join(config.root || process.cwd(), options.styles.configFile))
        }
      }
    },
    async resolveId (source, importer, { custom }) {
      if (
        configFile &&
        source === 'vuetify/styles' || (
          importer &&
          source.endsWith('.css') &&
          isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
        )
      ) {
        if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, { skipSelf: true, custom })
        }

        const resolution = await this.resolve(source, importer, { skipSelf: true, custom })
        if (!resolution)
          return

        const target = resolution.id.replace(/\.css$/, '.sass')
        tempFiles.set(target, isNone
          ? ''
          : `@use "${normalizePath(configFile)}"\n@use "${resolution.id}"`
        )
        return target
      }
    },
    load(id) {
      return isNone || usingSassVariables ? tempFiles.get(id) : undefined
    },
  } satisfies Plugin
}

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
